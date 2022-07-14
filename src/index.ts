// We do not export the Manager and Module classes as they are not intended to be initialized outside the library
// We do not export all types as there are many types exclusively used internally

// This is the main interface for initializing and interacting with discord-botly
export { default as BotlyClient } from "./BotlyClient";

// These are the main types that the end-user may need access to
export type {
    Prefix,
    InitArgs,
    BotlyModule,
    CatchFunction,
    FilterFunction,
    PrefixCommandData,
} from '../typings/index';
