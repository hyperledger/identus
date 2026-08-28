
import React from "react"
import { Provider } from "react-redux";
import { store } from "../reducers/store";



//Used to mount the SDK Store
//Called once by the UI
//TODO: Check if the component has already mounted
export const MountSDK = (props: any) => {
    const { children } = props;
    return <Provider store={store}>{children}</Provider>
}
