import { useAgentContext } from "@/context/AgentContext";
import SDK from "@hyperledger/identus-sdk";
import { useCallback } from "react";
import { acceptCredentialOffer, createPrismDID } from "@/agent";

export function useAgent() {
  const { agent, agentState, isInitialized, initializeWallet, recoverWallet, stopAgent } =
    useAgentContext();

  const isRunning = agentState === SDK.Domain.Startable.State.RUNNING;

  const createDID = useCallback(
    async (alias?: string): Promise<SDK.Domain.DID> => {
      if (!agent) throw new Error("Agent not initialized");
      return createPrismDID(agent, alias ?? `did-${Date.now()}`);
    },
    [agent]
  );

  const acceptOffer = useCallback(
    async (oobJson: string): Promise<void> => {
      if (!agent) throw new Error("Agent not initialized");
      await acceptCredentialOffer(agent, oobJson);
    },
    [agent]
  );

  return {
    agent,
    agentState,
    isRunning,
    isInitialized,
    initializeWallet,
    recoverWallet,
    stopAgent,
    createDID,
    acceptOffer,
  };
}
