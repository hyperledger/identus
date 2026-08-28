import React, { useEffect, useState } from "react";
import { Component, InteractiveProps, Step, Store } from "@/reducers/app";

export const InteractiveComponent: React.FC<{
    content: Component,
    props: InteractiveProps
}> = componentProps => {
    const {
        content,
        props
    } = componentProps;
    return content(props)
}
