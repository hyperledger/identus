"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ShieldCheck, Send, XCircle, Loader2 } from "lucide-react";
import { AuthRequest, AuthResponse } from "@/types";

export default function MockWallet() {
  const searchParams = useSearchParams();
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "sending" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oob = searchParams.get("_oob");
    if (oob) {
      try {
        // The oob in the URL is base64 encoded string, which contains the JSON
        // but in my page.tsx I encoded the oobUrl itself. Let me fix that.
        // Actually, let's just parse it directly for the demo.
        const decodedOob = Buffer.from(oob, "base64").toString("utf-8");
        // In the demo, oob is didcomm://auth?_oob=DATA
        // but I might have passed just the DATA or the whole URL.
        // Let's handle both.
        let jsonData = decodedOob;
        if (jsonData.startsWith("didcomm://")) {
           const url = new URL(jsonData);
           const data = url.searchParams.get("_oob");
           if (data) jsonData = Buffer.from(data, "base64").toString("utf-8");
        }
        
        const parsed = JSON.parse(jsonData);
        setRequest(parsed);
        setStatus("ready");
      } catch (err) {
        console.error("Failed to parse OOB:", err);
        setError("Invalid Auth Request");
        setStatus("error");
      }
    } else {
      setError("No Auth Request found");
      setStatus("error");
    }
  }, [searchParams]);

  const approve = async () => {
    if (!request) return;
    setStatus("sending");

    const response: AuthResponse = {
      id: Math.random().toString(36).substring(7),
      type: "https://lace.io/auth/1.0/msg",
      thid: request.id,
      body: {
        challenge: request.body.challenge,
        signature: `sig-${request.body.challenge}`, // Mock signature
        did: "did:prism:1234567890abcdefghijklmnopqrstuvwxyz", // Mock user DID
      },
      from: "did:prism:user-wallet",
    };

    try {
      const res = await fetch(request.body.callback_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to send response to server");
        setStatus("error");
      }
    } catch (err) {
      setError("Network error");
      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm glass overflow-hidden flex flex-col h-[600px] shadow-2xl border-blue-500/20"
      >
        {/* Wallet Header */}
        <div className="bg-blue-600 p-6 flex items-center gap-3">
          <Wallet className="text-white" />
          <h1 className="font-bold text-xl">Lace Wallet</h1>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-gray-400">Resolving Request...</p>
              </motion.div>
            )}

            {status === "ready" && request && (
              <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <ShieldCheck className="text-blue-400" size={32} />
                  </div>
                  <h2 className="text-xl font-bold">Auth Request</h2>
                  <p className="text-sm text-gray-400">
                    <span className="text-blue-400 font-semibold">{request.from}</span> is requesting to verify your identity.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Permissions</p>
                    <ul className="text-xs space-y-1 mt-1">
                      {request.body.scope?.map(s => (
                        <li key={s} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1 h-1 bg-green-500 rounded-full" /> {s}
                        </li>
                      )) || <li className="text-gray-500">None</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Challenge</p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{request.body.challenge}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={approve}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                  >
                    <Send size={18} /> Approve & Sign
                  </button>
                  <button
                    onClick={() => window.close()}
                    className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 rounded-xl transition-all"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            )}

            {status === "sending" && (
              <motion.div key="sending" className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="text-gray-400">Signing & Sending...</p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div 
                key="success" 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-4 text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                  <ShieldCheck className="text-green-500" size={48} />
                </div>
                <h2 className="text-2xl font-bold">Authenticated</h2>
                <p className="text-gray-400 text-sm">
                  Identity proof sent successfully. You can close this window now.
                </p>
                <button
                  onClick={() => window.close()}
                  className="mt-4 px-8 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Close Wallet
                </button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <XCircle className="text-red-500" size={64} />
                <h2 className="text-xl font-bold">Error</h2>
                <p className="text-red-400 text-sm">{error || "Something went wrong"}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-8 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
