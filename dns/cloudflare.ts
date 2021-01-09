import {DNSSetter} from "../types/DNSSetter.ts";

interface CloudflareOpts {
    zone: string,
    email: string,
    token: string,
}

const api = "https://api.cloudflare.com/client/v4/"

let set: DNSSetter = async (opts) => {
    // sort ips by ipv6/ipv4:
    let ipv6: string[] = [];
    let ipv4: string[] = [];

    let custom = opts.custom as CloudflareOpts;

    opts.ips.forEach(v => v.includes(":") ? ipv6.push(v) : ipv4.push(v));

    let zoneId = await getZoneId(custom);

    let dnsRecords = await getDnsRecords(custom, zoneId);

    for (let domain of opts.domains) {
        let domainRecords = dnsRecords.filter(v => v.name == domain);

        let v6recs = domainRecords.filter(v => v.type === "AAAA");
        let v4recs = domainRecords.filter(v => v.type === "A");

        for (let i = 0; i < ipv6.length; i++) {
            let rec = v6recs[i];
            let ip = ipv6[i];
            if (rec === undefined) {
                await createDnsRecord(custom, zoneId, {
                    content: ip,
                    name: domain,
                    ttl: 1,
                    type: "AAAA",
                })
            } else {
                await updateDnsRecord(custom, zoneId, rec.id, ip);
            }
        }

        for (let i = 0; i < ipv4.length; i++) {
            let rec = v4recs[i];
            let ip = ipv4[i];
            if (rec === undefined) {
                await createDnsRecord(custom, zoneId, {
                    content: ip,
                    name: domain,
                    ttl: 1,
                    type: "A",
                })
            } else {
                await updateDnsRecord(custom, zoneId, rec.id, ip);
            }
        }
    }
}

async function getZoneId(opts: CloudflareOpts) {
    let res = await fetch(api + `zones?name=${opts.zone}`, {
        headers: getHeaders(opts)
    });
    //TODO: type
    let data = await res.json();
    if (!data.success) {
        console.error(data.errors);
        Deno.exit(1);
    }
    return data.result[0].id as string;
}

async function getDnsRecords(opts: CloudflareOpts, zoneid: string) {
    let res = await fetch(api + `zones/${zoneid}/dns_records`, {headers: getHeaders(opts)});
    let data = await res.json();

    //TODO: type
    if (!data.success) {
        console.error(data.errors);
        Deno.exit(1);
    }
    return data.result as {id: string, type: "A" | "AAAA", name: string}[];
}

async function updateDnsRecord(opts: CloudflareOpts, zoneId: string, dnsId: string, ip: string) {
    let res = await fetch(api + `zones/${zoneId}/dns_records/${dnsId}`, {
        headers: getHeaders(opts),
        method: "PATCH",
        body: JSON.stringify({
            content: ip,
        })
    });
    let data = await res.json();
    if (!data.success) {
        console.error(data.errors);
        Deno.exit(1);
    }
    return true;
}

async function createDnsRecord(opts: CloudflareOpts, zoneId: string, conf: {
    content: string,
    name: string,
    type: "A" | "AAAA",
    ttl: number,
}) {
    let res = await fetch(api + `zones/${zoneId}/dns_records`, {
        headers: getHeaders(opts),
        method: "POST",
        body: JSON.stringify(conf),
    });
    let data = await res.json();
    if (!data.success) {
        console.error(data.errors);
        Deno.exit(1);
    }
    return true;
}

function getHeaders(opts: CloudflareOpts) {
    return {
        "X-Auth-Email": opts.email,
        "X-Auth-Key": opts.token,
        "Content-Type": "application/json",
    }
}

export default set;