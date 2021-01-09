import {Indexed} from "./Indexed.ts";

/**
 * All domains should be assigned all the IPs
 */
interface DNSOpts {
    ips: string[];
    domains: string[];
    custom: Indexed<any>;
}

type DNSSetter = (opts: DNSOpts) => Promise<void>;

export type {DNSSetter, DNSOpts};