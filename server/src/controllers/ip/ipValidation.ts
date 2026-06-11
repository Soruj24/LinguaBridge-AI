import { Request } from "express";
import NodeCache from "node-cache";

export const ipCache = new NodeCache({ stdTTL: 3600 });

export const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const isPrivateIP = (ip: string): boolean => {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fe80:/,
    /^fc00:/,
    /^fd00:/
  ];
  return privateRanges.some(range => range.test(ip));
};

export const getClientIP = (req: Request): string | null => {
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
    'x-cluster-client-ip'
  ];

  for (const header of possibleHeaders) {
    const value = req.headers[header];
    if (value) {
      let ip: string;

      if (Array.isArray(value)) {
        ip = value[0];
      } else {
        ip = value.toString().split(',')[0].trim();
      }

      ip = ip.split(':')[0];

      if (isValidIP(ip) && !isPrivateIP(ip)) {
        console.log(`Found IP from header ${header}: ${ip}`);
        return ip;
      }
    }
  }

  let clientIP = req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress;

  if (clientIP) {
    if (clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.substring(7);
    }
    if (clientIP === '::1') {
      clientIP = '127.0.0.1';
    }

    const ipParts = clientIP.split(':');
    if (ipParts.length > 1 && ipParts[ipParts.length - 1].match(/^\d+$/)) {
      clientIP = ipParts.slice(0, -1).join(':');
    }

    if (isValidIP(clientIP) && !isPrivateIP(clientIP)) {
      console.log(`Found IP from connection: ${clientIP}`);
      return clientIP;
    }
  }

  console.log('No valid public IP found in headers or connection');
  return null;
};
