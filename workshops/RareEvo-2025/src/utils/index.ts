import { useMessages } from "@trust0/identus-react/hooks";
import SDK from "@hyperledger/identus-sdk";
import { useMemo } from "react";

export function useMessageStatus(message: SDK.Domain.Message | string) {
    const {
      messages
    } = useMessages();

    const thid = typeof message === 'string' ? message : message.thid

    const relatedMessages  = useMemo(() => {
      return messages.filter(({message: m}) => m.thid === thid);
    }, [messages, thid]);

    const receivedMessages = useMemo(() => relatedMessages.filter(({message: m}) => m.direction === SDK.Domain.MessageDirection.RECEIVED), [relatedMessages]);
    const sentMessages = useMemo(() => relatedMessages.filter(({message: m}) => m.direction === SDK.Domain.MessageDirection.SENT), [relatedMessages]);
    const hasResponse =  receivedMessages.length > 0;
    const hasAnswered =  sentMessages.length > 0;

    return {
        hasResponse,
        hasAnswered,
    };
}

// Custom comparison function that ignores functions and handles circular references
export function isEqualIgnoringFunctions(obj1: any, obj2: any, visited = new WeakSet()): boolean {
    if (obj1 === obj2) return true;

    // Handle null and undefined
    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }

    // Handle primitive types
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return obj1 === obj2;
    }

    // Handle circular references
    if (visited.has(obj1) || visited.has(obj2)) {
      return true; // Assume equal for circular references
    }

    visited.add(obj1);
    visited.add(obj2);

    try {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        // Skip function comparisons
        if (typeof val1 === 'function' && typeof val2 === 'function') {
          continue;
        }

        // If one is a function and the other isn't, they're different
        if (typeof val1 === 'function' || typeof val2 === 'function') {
          continue;
        }

        // For non-functions, do deep comparison
        if (typeof val1 === 'object' && typeof val2 === 'object') {
          if (!isEqualIgnoringFunctions(val1, val2, visited)) {
            return false;
          }
        } else if (val1 !== val2) {
          return false;
        }
      }

      return true;
    } finally {
      visited.delete(obj1);
      visited.delete(obj2);
    }
  }
