import { useAgent, useDatabase, useMessages } from "@trust0/identus-react/hooks";
import { PaperAirplaneIcon, InboxIcon } from "@heroicons/react/24/outline";
import SDK from "@hyperledger/identus-sdk";

export function Status({ type }: { type: string }) {
    const { state: agentState } = useAgent();
    const { receivedMessages, sentMessages } = useMessages();

    // Determine status circle color based on agent state
    const getStatusColor = () => {
        if (agentState === SDK.Domain.Startable.State.RUNNING) {
            return "bg-green-500";
        } else if (agentState === SDK.Domain.Startable.State.STARTING) {
            return "bg-yellow-500";
        } else if (agentState === SDK.Domain.Startable.State.STOPPING) {
            return "bg-orange-500";
        } else {
            return "bg-red-500";
        }
    };

    // Get human-readable status text
    const getStatusText = () => {
        if (agentState === SDK.Domain.Startable.State.RUNNING) {
            return "Running";
        } else if (agentState === SDK.Domain.Startable.State.STARTING) {
            return "Starting";
        } else if (agentState === SDK.Domain.Startable.State.STOPPING) {
            return "Stopping";
        } else {
            return "Stopped";
        }
    };

    return (
        <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
            {/* Agent Status */}
            <div className="flex items-center space-x-1 md:space-x-2">
                <div className={`w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full ${getStatusColor()}`}></div>
                <span className="text-xs md:text-sm lg:text-base font-medium text-slate-700">
                    {type.charAt(0).toUpperCase() + type.slice(1)} <span className="text-xs md:text-sm lg:text-base text-slate-500">
                    {getStatusText()}
                </span>
                </span>

            </div>

            {/* Messages */}
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4">
                {/* Received Messages */}
                <div className="flex items-center space-x-1">
                    <InboxIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-500" />
                    <span className="text-xs md:text-sm lg:text-base text-slate-600">{receivedMessages.length}</span>
                </div>

                {/* Sent Messages */}
                <div className="flex items-center space-x-1">
                    <PaperAirplaneIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-500" />
                    <span className="text-xs md:text-sm lg:text-base text-slate-600">{sentMessages.length}</span>
                </div>
            </div>
        </div>
    );
}
