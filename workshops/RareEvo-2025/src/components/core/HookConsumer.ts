'use client';

import { useDatabase, useAgent, useMessages, useConnections, useCredentials, useHolder, useIssuer, usePeerDID, usePrismDID, useVerifier } from "@trust0/identus-react/hooks"
import { useEffect } from "react"

export function HookConsumer({ callback }: { callback: (ctx: any) => void }) {
    const database = useDatabase()
    const agent = useAgent()
    const messages = useMessages()
    const connections = useConnections()
    const credentials = useCredentials()
    const holder = useHolder()
    const issuer = useIssuer()
    const peerDID = usePeerDID()
    const prismDID = usePrismDID()
    const verifier = useVerifier()
    useEffect(() => {
        callback({
            useDatabase: database,
            useAgent: agent,
            useMessages: messages,
            useConnections: connections,
            useCredentials: credentials,
            useHolder: holder,
            useIssuer: issuer,
            usePeerDID: peerDID,
            usePrismDID: prismDID,
            useVerifier: verifier,
        })
    }, [database, agent, messages, connections, credentials, holder, issuer, peerDID, prismDID, verifier, callback])
    return null
}
