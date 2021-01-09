// Set dDNS
// Needs: --allow-env and --allow-net

import Config from "./types/Config.ts";
import cloudflareSet from "./dns/cloudflare.ts";
import ipifyGet from "./ip/ipify.ts";
import {Indexed} from "./types/Indexed.ts";
import {IPGetter} from "./types/IPGetter.ts";
import {DNSSetter} from "./types/DNSSetter.ts";

let envConf = Deno.env.get("DDNS_CONF");
if (envConf === undefined) {
    console.error("DDNS_CONF environment variable not set! Please set it to the JSON of the config (see config.default.json)");
    Deno.exit(1);
}

let conf: Config = JSON.parse(envConf);

let dnsModules: Indexed<DNSSetter> = {
    cloudflare: cloudflareSet,
}

let ipModules: Indexed<IPGetter> = {
    ipify: ipifyGet,
}

let ips = await ipModules[conf.ipModule]({
    use6: conf.use6,
    use4: conf.use4,
    custom: conf.ipConfig,
});

await dnsModules[conf.dnsModule]({
    domains: conf.domains,
    custom: conf.dnsConfig,
    ips: ips,
});