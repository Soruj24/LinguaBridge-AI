import { Request } from "express";

export const addSecurityInfo = (ipInfo: any, req: Request): any => {
  return {
    ...ipInfo,
    request_info: {
      user_agent: req.headers['user-agent'] || 'Unknown',
      accept_language: req.headers['accept-language'] || 'Unknown',
      referer: req.headers['referer'] || 'Direct',
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.originalUrl
    },
    security: {
      is_tor: ipInfo.threat?.is_tor || false,
      is_proxy: ipInfo.threat?.is_proxy || false,
      is_vpn: ipInfo.threat?.is_anonymous || false,
      risk_score: calculateRiskScore(ipInfo)
    }
  };
};

export const getClimateZone = (latitude: number): string => {
  const lat = Math.abs(latitude);
  if (lat >= 66.5) return 'Polar';
  if (lat >= 60) return 'Subarctic';
  if (lat >= 45) return 'Continental';
  if (lat >= 30) return 'Subtropical';
  if (lat >= 23.5) return 'Tropical';
  return 'Equatorial';
};

export const calculateRiskScore = (ipInfo: any): number => {
  let score = 0;
  if (ipInfo.threat?.is_tor) score += 30;
  if (ipInfo.threat?.is_proxy) score += 20;
  if (ipInfo.threat?.is_anonymous) score += 15;
  if (ipInfo.threat?.is_known_attacker) score += 50;
  if (ipInfo.threat?.is_known_abuser) score += 40;
  return Math.min(score, 100);
};
