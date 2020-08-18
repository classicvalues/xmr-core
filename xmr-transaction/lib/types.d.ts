import { BigInt } from "xmr-core/biginteger";
import { RCTSignatures } from "./";
export interface TransactionInput {
    type: string;
    amount: string;
    k_image: string;
    key_offsets: string[];
}
export interface TransactionOutput {
    amount: string;
    target: {
        type: string;
        key: string;
    };
}
export interface SignedTransaction {
    unlock_time: number;
    version: number;
    extra: string;
    vin: TransactionInput[];
    vout: TransactionOutput[];
    rct_signatures?: RCTSignatures;
    signatures?: string[][];
}
export declare type ParsedTarget = {
    address: string;
    amount: BigInt;
};
export declare type ViewSendKeys = {
    view: string;
    spend: string;
};
export declare type RawTarget = {
    address: string;
    amount: number;
};
export declare type Pid = string | null;
export declare type Output = {
    amount: string;
    public_key: string;
    index: number;
    global_index: number;
    rct: string;
    tx_id: number;
    tx_hash: string;
    tx_pub_key: string;
    tx_prefix_hash: string;
    spend_key_images: string[];
    timestamp: string;
    height: number;
};
export declare type AmountOutput = {
    amount: string;
    outputs: RandomOutput[];
};
declare type RandomOutput = {
    global_index: string;
    public_key: string;
    rct: string;
};
export interface RingMember {
    dest: string;
    mask: string;
}
export interface SecretCommitment {
    x: string;
    a: string;
}
export {};
//# sourceMappingURL=types.d.ts.map
