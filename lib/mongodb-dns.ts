import dns from "dns"

dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"])

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number
) => void

function stripPort(hostname: string): string {
  return hostname.replace(/:\d+$/, "").replace(/^\[/, "").replace(/\]$/, "")
}

/**
 * Custom DNS lookup for MongoDB driver on Windows (ISP DNS often returns ENOTFOUND).
 * Uses dns.resolve4 which respects dns.setServers().
 */
export function atlasDnsLookup(
  hostname: string,
  options: dns.LookupOneOptions | dns.LookupAllOptions | number,
  callback: LookupCallback
): void {
  const opts = typeof options === "number" ? { family: options } : options
  const wantAll = typeof opts === "object" && opts !== null && "all" in opts && opts.all
  const host = stripPort(hostname)

  dns.resolve4(host, (err, addresses) => {
    if (err) {
      callback(err, wantAll ? [] : "", 4)
      return
    }
    if (!addresses?.length) {
      callback(
        Object.assign(new Error(`No A record for ${host}`), { code: "ENOTFOUND" }),
        wantAll ? [] : "",
        4
      )
      return
    }
    if (wantAll) {
      callback(
        null,
        addresses.map((address) => ({ address, family: 4 as const }))
      )
      return
    }
    callback(null, addresses[0], 4)
  })
}
