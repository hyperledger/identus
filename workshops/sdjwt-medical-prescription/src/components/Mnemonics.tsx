
import { Box } from "@/app/Box";
import SDK from "@hyperledger/identus-edge-agent-sdk";
import { useState } from "react";



const apollo = new SDK.Apollo();





export function Mnemonics() {
    const [mnemonics, setMnemonics] = useState<string[]>([]);

    function createMnemonics() {
        setMnemonics(apollo.createRandomMnemonics());
    }

    return (
        <Box>
            <h1 className="mb-4 text-1xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                <span className=" decoration-8 decoration-blue-400 dark:decoration-blue-600">Random Mnemonics</span>
            </h1>

            <p className=" text-lg font-normal text-gray-500 lg:text-xl  dark:text-gray-400">Here you can generate random Mnemonics.</p>

            <button className="my-5 inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900" onClick={createMnemonics}>Generate random mnemonics</button>
            <ul className="flex flex-wrap pt-5 items-center justify-center text-gray-900 dark:text-white">

                {mnemonics
                    ? mnemonics.map((word, i) => (
                        <li key={`mnemonicWord${i}`} >
                            <span
                                key={i + word}
                                className="me-4 hover:underline md:me-6"
                            >
                                {i + 1}. {word}
                            </span>
                        </li>
                    ))
                    : null}
            </ul>
        </Box >
    );
}
