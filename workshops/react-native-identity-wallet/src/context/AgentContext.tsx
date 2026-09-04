import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SDK from "@hyperledger/identus-sdk";
import * as SecureStore from "expo-secure-store";
import {
  acceptPresentationRequest,
  createAgent,
  generateSeed,
  seedFromMnemonics,
} from "@/agent";
import { STORAGE_KEYS } from "@/config";
import { AsyncStoragePlutoStore } from "@/storage/AsyncStoragePlutoStore";

interface AgentContextValue {
  agent: SDK.Agent | null;
  apollo: SDK.Apollo | null;
  pluto: SDK.Pluto | null;
  agentState: SDK.Domain.Startable.State;
  /** True once the initial keychain lookup has completed. */
  isReady: boolean;
  /** True when the agent has been successfully started. */
  isInitialized: boolean;
  credentials: SDK.Domain.Credential[];
  messages: SDK.Domain.Message[];
  /** Latest inbound presentation request awaiting holder action. */
  pendingPresentationRequest: SDK.Domain.Message | null;
  initializeWallet: () => Promise<string[]>;
  recoverWallet: (mnemonics: string[]) => Promise<void>;
  createEncryptedBackup: () => Promise<string>;
  restoreEncryptedBackup: (backupJwe: string) => Promise<void>;
  respondToPresentationRequest: (credentialId: string) => Promise<void>;
  dismissPresentationRequest: () => void;
  stopAgent: () => Promise<void>;
  clearPlutoStorage: () => Promise<void>;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<SDK.Agent | null>(null);
  const [apollo, setApollo] = useState<SDK.Apollo | null>(null);
  const [pluto, setPluto] = useState<SDK.Pluto | null>(null);
  const [agentState, setAgentState] = useState<SDK.Domain.Startable.State>(
    SDK.Domain.Startable.State.STOPPED
  );
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [credentials, setCredentials] = useState<SDK.Domain.Credential[]>([]);
  const [messages, setMessages] = useState<SDK.Domain.Message[]>([]);
  const [pendingPresentationRequest, setPendingPresentationRequest] =
    useState<SDK.Domain.Message | null>(null);

  const agentRef = useRef<SDK.Agent | null>(null);
  const storeRef = useRef<SDK.Pluto.Store | null>(null);
  const messageListenerRef = useRef<
    ((messages: SDK.Domain.Message[]) => Promise<void>) | null
  >(null);

  const refreshCredentials = useCallback(async (currentPluto: SDK.Pluto) => {
    try {
      const stored = await currentPluto.getAllCredentials();
      setCredentials(stored);
    } catch {
      // Pluto may not be ready yet on first call
    }
  }, []);

  const detachMessageListener = useCallback((currentAgent: SDK.Agent | null) => {
    if (currentAgent && messageListenerRef.current) {
      currentAgent.removeListener(
        SDK.ListenerKey.MESSAGE,
        messageListenerRef.current
      );
      messageListenerRef.current = null;
    }
  }, []);

  const startAgentWithSeed = useCallback(
    async (seed: SDK.Domain.Seed) => {
      detachMessageListener(agentRef.current);

      if (agentRef.current) {
        await agentRef.current.stop();
      }

      const {
        agent: newAgent,
        apollo: newApollo,
        pluto: newPluto,
        store,
        startError,
      } = await createAgent(seed);

      agentRef.current = newAgent;
      storeRef.current = store;
      setAgent(newAgent);
      setApollo(newApollo);
      setPluto(newPluto);
      setAgentState(
        startError
          ? SDK.Domain.Startable.State.STOPPED
          : SDK.Domain.Startable.State.RUNNING
      );

      const onMessage = async (incomingMessages: SDK.Domain.Message[]) => {
        setMessages((prev) => [...prev, ...incomingMessages]);

        for (const msg of incomingMessages) {
          if (msg.piuri === SDK.ProtocolType.DidcommIssueCredential) {
            try {
              await newAgent.handle(msg);
              await refreshCredentials(newPluto);
            } catch (err) {
              console.warn("Failed to auto-handle issued credential:", err);
            }
            continue;
          }

          if (msg.piuri === SDK.ProtocolType.DidcommRequestPresentation) {
            setPendingPresentationRequest(msg);
          }
        }
      };

      messageListenerRef.current = onMessage;
      newAgent.addListener(SDK.ListenerKey.MESSAGE, onMessage);

      await refreshCredentials(newPluto);
      if (startError) {
        console.warn("Agent started in offline mode:", startError);
      }
      setIsInitialized(true);
    },
    [detachMessageListener, refreshCredentials]
  );

  // Auto-start if mnemonics are already stored
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEYS.MNEMONICS);
        if (stored && !cancelled) {
          const mnemonics = JSON.parse(stored) as string[];
          const tmpApollo = new SDK.Apollo();
          const seed = seedFromMnemonics(tmpApollo, mnemonics);
          await startAgentWithSeed(seed);
        }
      } catch (error) {
        console.warn("Failed to auto-start wallet:", error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startAgentWithSeed]);

  const initializeWallet = useCallback(async (): Promise<string[]> => {
    const tmpApollo = new SDK.Apollo();
    const { seed, mnemonics } = generateSeed(tmpApollo);

    await SecureStore.setItemAsync(
      STORAGE_KEYS.MNEMONICS,
      JSON.stringify(mnemonics)
    );

    await startAgentWithSeed(seed);
    return mnemonics;
  }, [startAgentWithSeed]);

  const recoverWallet = useCallback(
    async (mnemonics: string[]): Promise<void> => {
      const tmpApollo = new SDK.Apollo();
      const seed = seedFromMnemonics(tmpApollo, mnemonics);

      await SecureStore.setItemAsync(
        STORAGE_KEYS.MNEMONICS,
        JSON.stringify(mnemonics)
      );

      await startAgentWithSeed(seed);
    },
    [startAgentWithSeed]
  );

  const stopAgent = useCallback(async () => {
    detachMessageListener(agentRef.current);

    if (agentRef.current) {
      await agentRef.current.stop();
      agentRef.current = null;
    }

    if (storeRef.current?.stop) {
      await storeRef.current.stop();
    }
    storeRef.current = null;

    setAgent(null);
    setApollo(null);
    setPluto(null);
    setCredentials([]);
    setMessages([]);
    setPendingPresentationRequest(null);
    setIsInitialized(false);
    setAgentState(SDK.Domain.Startable.State.STOPPED);
  }, [detachMessageListener]);

  const clearPlutoStorage = useCallback(async () => {
    if (
      storeRef.current &&
      typeof (storeRef.current as { clearAll?: () => Promise<void> }).clearAll ===
        "function"
    ) {
      await (storeRef.current as { clearAll: () => Promise<void> }).clearAll();
      return;
    }

    await AsyncStoragePlutoStore.clearPersisted();
  }, []);

  const createEncryptedBackup = useCallback(async (): Promise<string> => {
    if (!agentRef.current) {
      throw new Error("Agent not initialized");
    }

    return agentRef.current.backup.createJWE({
      compress: true,
      excludes: ["messages"],
    });
  }, []);

  const restoreEncryptedBackup = useCallback(
    async (backupJwe: string): Promise<void> => {
      if (!agentRef.current || !pluto) {
        throw new Error("Agent not initialized");
      }

      await agentRef.current.backup.restore(backupJwe, { compress: true });
      await refreshCredentials(pluto);
    },
    [pluto, refreshCredentials]
  );

  const respondToPresentationRequest = useCallback(
    async (credentialId: string): Promise<void> => {
      if (!agentRef.current || !pendingPresentationRequest) {
        throw new Error("No presentation request is pending");
      }

      const credential = credentials.find((item) => item.id === credentialId);
      if (!credential) {
        throw new Error("Credential not found");
      }

      await acceptPresentationRequest(
        agentRef.current,
        pendingPresentationRequest,
        credential
      );
      setPendingPresentationRequest(null);
    },
    [credentials, pendingPresentationRequest]
  );

  const dismissPresentationRequest = useCallback(() => {
    setPendingPresentationRequest(null);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        agent,
        apollo,
        pluto,
        agentState,
        isReady,
        isInitialized,
        credentials,
        messages,
        pendingPresentationRequest,
        initializeWallet,
        recoverWallet,
        createEncryptedBackup,
        restoreEncryptedBackup,
        respondToPresentationRequest,
        dismissPresentationRequest,
        stopAgent,
        clearPlutoStorage,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error("useAgentContext must be used inside <AgentProvider>");
  }
  return ctx;
}
