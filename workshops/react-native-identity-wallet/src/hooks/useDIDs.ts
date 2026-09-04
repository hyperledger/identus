import { useAgentContext } from "@/context/AgentContext";
import SDK from "@hyperledger/identus-sdk";
import { useCallback, useEffect, useState } from "react";

export function useDIDs() {
  const { pluto, agent } = useAgentContext();
  const [dids, setDIDs] = useState<SDK.Domain.DID[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!pluto) {
      setDIDs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const stored = await pluto.getAllPrismDIDs();
      const unique = Array.from(
        new Map(stored.map((item) => [item.did.toString(), item.did])).values()
      );
      setDIDs(unique);
    } finally {
      setLoading(false);
    }
  }, [pluto]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDID = useCallback(
    async (alias?: string): Promise<SDK.Domain.DID> => {
      if (!agent) throw new Error("Agent not initialized");
      const task = new SDK.Tasks.CreatePrismDID({
        authenticationKeyCurve: SDK.Domain.Curve.SECP256K1,
        services: [],
        alias: alias ?? `did-${Date.now()}`,
      });
      const did = await agent.runTask(task);
      await refresh();
      return did;
    },
    [agent, refresh]
  );

  const resolveDID = useCallback(
    async (didString: string): Promise<SDK.Domain.DIDDocument> => {
      if (!agent) throw new Error("Agent not initialized");
      return agent.castor.resolveDID(didString);
    },
    [agent]
  );

  return { dids, loading, refresh, createDID, resolveDID };
}
