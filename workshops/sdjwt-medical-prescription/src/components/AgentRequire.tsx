import { useMountedApp } from "@/reducers/store";
import React from "react";

export function AgentRequire({ children, text, hide }: { hide?: boolean, children: any, text?: string }) {

    const { agent } = useMountedApp();
    // Function to recursively clone children with disabled prop set to true
    const disableInputs = (child) => {
        // If the child is an input element, clone it with disabled prop set to true
        if (
            React.isValidElement(child) &&
            (child.type === 'input' || child.type === 'button')
        ) {
            if (hide) {
                return null;

            }
            return React.cloneElement(child, { disabled: true } as any);
        }
        // If the child has children, recursively iterate over its children
        if (child && child.props && child.props.children) {
            return React.cloneElement(child, {
                children: React.Children.map(child.props.children, disableInputs)
            });
        }
        // Otherwise, return the child as is
        return child;
    };

    // Clone the children with disabled prop set to true
    const disabledChildren = React.Children.map(children, disableInputs);



    if (agent && agent.hasStarted) {
        return children
    }

    return <>
        {disabledChildren}
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">Agent required</span> {text || 'You cannot respond to messages while the agent is not running.'}
        </div>
    </>
}
