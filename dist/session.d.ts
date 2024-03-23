/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
type SessionId = string;
type Value = string | boolean | number;
type KeyValue = {
    [key: string]: Value;
};
export declare class Session {
    private static readonly DB_URL;
    private static readonly keyv;
    private req;
    private res;
    private sessid;
    constructor(req: IncomingMessage & {
        cookies: Partial<{
            [key: string]: string;
        }>;
    }, res: ServerResponse<IncomingMessage>);
    setId(sessionId: string): void;
    getId(): Promise<SessionId>;
    regenerateId(): Promise<void>;
    destroy(): Promise<void>;
    get(key?: string): Promise<Value | KeyValue | null>;
    set(key: string, value: Value): Promise<true>;
}
export {};
