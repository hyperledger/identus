import { useMountedApp } from "@/reducers/store";
import { useState } from "react";

export function DBConnect({ children }) {
    function onConnectClick() {
        if (!password) {
            return
        }
        return connectDatabase({
            encryptionKey: Buffer.from(password)
        })
    }

    const [password, setPassword] = useState<string>("elribonazo")
    const { db, connectDatabase } = useMountedApp();
    const isConnected = db.connected;

    if (isConnected) {
        return <>
            {children}
        </>
    }

    return <div
        className="w-full mt-5 p-6 bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700 "
    >
        <h1>Database connection</h1>
        <p className="my-5 text-lg font-normal text-gray-500 lg:text-xl  dark:text-gray-400">
            Your database is currently not connected, enter the password and click connect.
        </p>
        <input
            type="password"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value)
            }}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        <button className=" my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={onConnectClick}>
            Connect
        </button>
    </div>
}
