import {Indexed} from "./Indexed.ts";

interface IPOpts {
    use6: boolean;
    use4: boolean;
    custom: Indexed<any>;
}

/**
 * function that returns list of IPs
 */
type IPGetter = (opts: IPOpts) => Promise<string[]>;

export type {IPOpts, IPGetter};

