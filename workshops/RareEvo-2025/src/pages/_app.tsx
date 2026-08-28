'use client';
import React, { createContext, useContext, useEffect, useState } from "react";
import { MeshProvider, useWallet } from "@meshsdk/react";
import { Store } from "@/types";
import { BrowserWallet } from "@meshsdk/core";


type WorkshopContextType = Store & {
    setStore: (store: Partial<Store>) => void;
}
const WorkshopContext = createContext<WorkshopContextType| undefined>(undefined);

export function useWorkshop() {
    const context = useContext(WorkshopContext);
    if (!context) {
        throw new Error('useWorkshop must be used within a WorkshopProvider');
    }
    return context;
}

function WorkshopProvider({ children }: { children: React.ReactNode }) {
    const [store, setStore] = useState<Store>({} as Store);
    const { connect, connected } = useWallet();

    useEffect(() => {
      if (!connected) {
        BrowserWallet
        .getAvailableWallets()
        .then(async (wallets) => {
            if (wallets.find((w) => w.name === 'lace')) {
                await connect('lace', true);
            }
        })
      }
    }, [connect, setStore, store, connected])
    return <WorkshopContext.Provider value={{ ...store, setStore: (store) => setStore((prev) => ({ ...prev, ...store })) }}>
        {children}
    </WorkshopContext.Provider>
}

function App({ Component, pageProps }: { Component: React.ComponentType, pageProps: any }) {
    return <MeshProvider>
        <WorkshopProvider>
            <Component {...pageProps} />
        </WorkshopProvider>
    </MeshProvider>;
}

export default App;
