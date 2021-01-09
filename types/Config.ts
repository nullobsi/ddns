import {Indexed} from "./Indexed.ts";

export default interface Config {
    ipModule: string;
    use4: boolean;
    use6: boolean;
    dnsModule: string;

    ipConfig: Indexed<any>;
    dnsConfig: Indexed<any>;

    domains: string[];
}