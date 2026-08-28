'use client'
import { InteractiveProps } from "@/reducers/app";
import React from "react";



export default {
    title: 'Step 1: Configure and deploy the services',
    description:
        'Set up your environment by running the following commands in your terminal.',
    content: [
        (props: InteractiveProps) => (<div className="py-2 text-gray-600 transition duration-200">
            <p className="text-xl font-semibold text-blue-700">Enable host networking in Docker (only mac)</p>
            <p>Please make sure that your docker version is updated and enable the following settings.</p>
            <p className="mb-2 text-center md:text-left">
                Open Docker settings, click on <i>resources</i> {"->"} <i>network</i> and enable host networking and save to apply and restart docker service.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
                    <p className="my-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white font-semibold">
                            1
                        </span>
                        <span>Open Docker settings and click on Resources</span>
                    </p>
                    <img
                        src="docker-settings.png"
                        alt="Docker Settings"
                        className="w-[250px] h-auto"
                    />
                </div>
                <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
                    <p className="my-2 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white font-semibold">
                            2
                        </span>
                        <span>Navigate to Network settings and enable host networking</span>
                    </p>
                    <img
                        src="network-settings.png"
                        alt="Network Settings"
                        className="w-[600px] h-auto"
                    />
                </div>
            </div>
            <p className="text-xl font-semibold text-blue-700 mt-4">Loading the services</p>
            <p>Inside the demo directory, ./demos/next-sdjwt-workshop, run docker compose</p>
            <p>Before you continue, please make sure the following ports are free on your local machine: <br />
                - <strong>8085</strong> Agent REST API<br />
                - <strong>8090</strong> Agent DIDComm<br />
                - <strong>8080</strong> Mediator DIDComm<br />
                - <strong>3000</strong> Website<br />
                - <strong>5432</strong> Postgres<br />
                - <strong>27017</strong> Mongo DB<br />
                - <strong>50053</strong> PRISM node<br />
            </p>
        </div>
        ),
        () => {
            return <div className="py-2 text-gray-600 transition duration-200">
                <p>Once setup you can pull docker images and setup the environments by running this command: </p>
            </div>
        },
        {
            language: 'bash',
            code: `docker compose up`,
        },
    ],
}
