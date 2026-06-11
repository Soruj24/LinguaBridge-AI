export const ipServiceProviders = [
  {
    name: 'ipapi.co',
    url: (ip: string) => `https://ipapi.co/${ip}/json/`,
    timeout: 5000,
    parser: (data: any) => ({
      ip: data.ip,
      city: data.city,
      region: data.region,
      region_code: data.region_code,
      country: data.country_name,
      country_code: data.country_code,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      country_calling_code: data.country_calling_code,
      currency: data.currency,
      languages: data.languages,
      asn: data.asn,
      org: data.org,
      isp: data.org,
      threat: {
        is_tor: data.threat?.is_tor || false,
        is_proxy: data.threat?.is_proxy || false,
        is_anonymous: data.threat?.is_anonymous || false,
        is_known_attacker: data.threat?.is_known_attacker || false,
        is_known_abuser: data.threat?.is_known_abuser || false,
        is_threat: data.threat?.is_threat || false,
        is_bogon: data.threat?.is_bogon || false
      }
    })
  },
  {
    name: 'ip-api.com',
    url: (ip: string) => `http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
    timeout: 5000,
    parser: (data: any) => ({
      ip: data.query,
      city: data.city,
      region: data.regionName,
      region_code: data.region,
      country: data.country,
      country_code: data.countryCode,
      postal: data.zip,
      latitude: data.lat,
      longitude: data.lon,
      timezone: data.timezone,
      utc_offset: data.offset,
      currency: data.currency,
      asn: data.as,
      org: data.org,
      isp: data.isp,
      threat: {
        is_proxy: data.proxy || false,
        is_hosting: data.hosting || false,
        is_mobile: data.mobile || false
      }
    })
  }
];

export const fallbackProviders = [
  {
    name: 'ipify',
    url: 'https://api.ipify.org?format=json',
    timeout: 3000,
    parser: (data: any) => data.ip
  },
  {
    name: 'icanhazip',
    url: 'https://icanhazip.com',
    timeout: 3000,
    parser: (data: any) => data.trim()
  },
  {
    name: 'jsonip',
    url: 'https://jsonip.com',
    timeout: 3000,
    parser: (data: any) => data.ip
  }
];
