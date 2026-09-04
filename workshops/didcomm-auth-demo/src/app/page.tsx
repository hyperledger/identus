"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Key, LogIn, CheckCircle, Smartphone, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<"welcome" | "qr" | "success">("welcome");
  const [session, setSession] = useState<{ sessionId: string; oobUrl: string } | null>(null);
  const [status, setStatus] = useState<"pending" | "authenticated" | "error">("pending");
  const [did, setDid] = useState<string | null>(null);

  const startLogin = async () => {
    try {
      const res = await fetch("/api/auth/request");
      const data = await res.json();
      setSession(data);
      setStep("qr");
    } catch (err) {
      console.error("Failed to start login:", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "qr" && session) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/status/${session.sessionId}`);
          const data = await res.json();
          if (data.status === "authenticated") {
            setDid(data.did);
            setStatus("authenticated");
            setStep("success");
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step, session]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 space-y-6 text-center"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-blue-500/20 rounded-2xl animate-float">
                  <Shield size={48} className="text-blue-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Identity Secure</h1>
              <p className="text-gray-400">
                Authenticate securely using your Decentralized Identity (DID) via DIDComm.
              </p>
              <button
                onClick={startLogin}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] glow"
              >
                <LogIn size={20} />
                Sign in with Wallet
              </button>
            </motion.div>
          )}

          {step === "qr" && session && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-8 space-y-6 text-center"
            >
              <div className="flex justify-between items-center mb-2">
                <button onClick={() => setStep("welcome")} className="text-gray-400 hover:text-white text-sm">
                  Cancel
                </button>
                <span className="text-xs text-blue-400 font-mono uppercase tracking-widest">DIDComm Auth</span>
              </div>
              <h2 className="text-2xl font-semibold">Scan with Wallet</h2>
              <p className="text-sm text-gray-400">
                Open your DID Wallet and scan the QR code to sign the challenge.
              </p>
              
              <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
                <QRCodeSVG value={session.oobUrl} size={220} />
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <Smartphone size={14} /> Mobile
                </div>
                <div className="flex items-center gap-1">
                  <Key size={14} /> Encrypted
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={14} /> Decentralized
                </div>
              </div>

              {/* Demo Shortcut */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter mb-2">Demo Simulator</p>
                <a 
                  href={`/wallet?_oob=${Buffer.from(session.oobUrl).toString("base64")}`} 
                  target="_blank"
                  className="text-xs text-blue-400 hover:underline flex items-center justify-center gap-1"
                >
                  Open Mock Wallet <ArrowRight size={12} />
                </a>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 space-y-6 text-center"
            >
              <div className="flex justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="p-4 bg-green-500/20 rounded-full"
                >
                  <CheckCircle size={64} className="text-green-400" />
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold">Login Successful</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">Authenticated DID</p>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 break-all font-mono text-xs text-blue-300">
                  {did}
                </div>
              </div>
              <p className="text-gray-400">
                You have successfully authenticated using the DIDComm Auth protocol.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-gray-600 text-sm flex gap-4 uppercase tracking-[0.2em] font-light">
        <span>Hyperledger Identus</span>
        <span>•</span>
        <span>DIDComm v2</span>
      </footer>
    </main>
  );
}
