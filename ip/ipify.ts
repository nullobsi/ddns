import {IPGetter} from "../types/IPGetter.ts";

type IpifyResp = {ip: string};

const get: IPGetter = async (opts) => {
    let ips = [];
    if (opts.use4) {
        let res = await fetch("https://api.ipify.org?format=json");
        let json = await res.json() as IpifyResp;
        ips.push(json.ip);
    }
    if (opts.use6) {
        let res = await fetch("https://api6.ipify.org?format=json");
        let json = await res.json() as IpifyResp;
        ips.push(json.ip);
    }
    return ips;
}

export default get;