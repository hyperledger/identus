import { useAgentContext } from "@/context/AgentContext";
import SDK from "@hyperledger/identus-sdk";
import { useCallback } from "react";

export function useCredentials() {
  const { credentials, pluto, agent } = useAgentContext();

  const getCredentialById = useCallback(
    (id: string): SDK.Domain.Credential | undefined => {
      return credentials.find((c) => c.id === id);
    },
    [credentials]
  );

  /**
   * Build a verifiable presentation proof for a given credential and
   * presentation request. Claims can be selectively disclosed for SD-JWT.
   */
  const createPresentation = useCallback(
    async (
      request: SDK.Domain.Message,
      credential: SDK.Domain.Credential,
      disclosedClaims?: Record<string, boolean>
    ): Promise<SDK.Domain.Message> => {
      if (!agent) throw new Error("Agent not initialized");

      const requestPresentation = SDK.RequestPresentation.fromMessage(request);
      const task = new SDK.Tasks.CreatePresentation({
        request: requestPresentation,
        credential,
      });
      const presentation = await agent.runTask(task);
      return presentation.makeMessage();
    },
    [agent]
  );

  const sendPresentation = useCallback(
    async (presentationMessage: SDK.Domain.Message): Promise<void> => {
      if (!agent) throw new Error("Agent not initialized");
      await agent.send(presentationMessage);
    },
    [agent]
  );

  return {
    credentials,
    getCredentialById,
    createPresentation,
    sendPresentation,
  };
}
