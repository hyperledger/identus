import React, { ReactNode } from 'react';
import SDK from '@hyperledger/identus-sdk';
import { Doc } from '@trust0/ridb-core'
import { schemas } from '@trust0/identus-react/db'
import { useRIDB } from '@trust0/ridb-react';
import { useDatabase } from '@trust0/identus-react/hooks';
export interface ContentItem {
    name: string
    type: AgentType
    content: ReactNode
  }
export type RequestState<T extends Doc<typeof schemas.issuance>> =
    {
        issuerRequest: T,
        issuerRequestOOB: T extends undefined | null ? never : string
      }


export type Store = {
    issuerStarted?: boolean,
    issuerPrismDID?: SDK.Domain.DID,
    issuerPrismDIDPublished?: boolean,
    holderAccepted?: boolean,
    issuerAccepted?: boolean,
    verifierRequestOOB?: string,
} & RequestState<Doc<typeof schemas.issuance>>


export type Claim = {
    id: string;
    name: string;
    value: string;
    type: string;
    isValid?: boolean;
};

export type UseDatabase = ReturnType<typeof useDatabase>;
export type IssuanceFlow = Awaited<ReturnType<UseDatabase["getIssuanceFlow"]>>;
export type Request = IssuanceFlow extends infer T ? T extends null ? never : T : never;

export type AgentType = 'issuer' | 'holder' | 'verifier';

export type Exists<T> = T extends undefined ? never : T;

export type _Hooks = typeof import('@trust0/identus-react/hooks')

export type Hooks = {
    [K in keyof Omit<_Hooks, 'usePluto' | 'useApollo' | 'useCastor'>]?: Exists<ReturnType<_Hooks[K]>>
} & {
    useRIDB: Exists<ReturnType<typeof useRIDB>>
}

export type CodeBlock = {
    language: string,
    code: string,
    showCopyButton?: boolean
}
export type Content = React.FC<NextFnProps & {type: AgentType, setIsPopupOpen?: (isOpen: boolean) => void}>;
export type DisableConditionFunction = (store: Store) => boolean;
export type DisableRenderFunction =  (hooks: Partial<Hooks>) => Promise<boolean>;

export type Step = {
    title: string,
    description: string,
    content: Content,
    type: AgentType,
    disableCondition?: DisableConditionFunction,
    codeSample?: CodeBlock,
    setIsPopupOpen?: (isOpen: boolean) => void,
}

export type AgentFnProps = {
    type: AgentType,
} & NextFnProps

export type NextFnProps = {
};



