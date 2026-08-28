import SDK from "@hyperledger/identus-edge-agent-sdk";
import { sha512 } from '@noble/hashes/sha512'
import InMemory from '@pluto-encrypted/inmemory'
import { ShortFormDIDResolverSample } from "./ShortFormDIDResolverSample";
import { MEDIATOR_URL } from "@/config";
import { Store } from "@/reducers/app";


export async function loadAgent(store: Store) {
    const hashedPassword = sha512("123456")
    const apollo = new SDK.Apollo();
    const identusStore = new SDK.Store({
        name: "testing",
        storage: InMemory,
        password: Buffer.from(hashedPassword).toString("hex")
    });
    const pluto = new SDK.Pluto(identusStore, apollo);
    const defaultSeed = new SDK.Apollo().createSeed([
        "repeat",
        "spider",
        "frozen",
        "drama",
        "april",
        "step",
        "engage",
        "pitch",
        "purity",
        "arrest",
        "orchard",
        "grocery",
        "green",
        "chapter",
        "know",
        "disease",
        "attend",
        "notable",
        "usage",
        "add",
        "trash",
        "dry",
        "refuse",
        "jewel"
    ])
    const extraResolvers = [
        ShortFormDIDResolverSample
    ];
    const castor = new SDK.Castor(apollo, extraResolvers)
    const agent = await SDK.Agent.initialize({
        apollo,
        castor,
        mediatorDID: store[`${MEDIATOR_URL}/did`],
        pluto,
        seed: defaultSeed
    });
    return agent
}
