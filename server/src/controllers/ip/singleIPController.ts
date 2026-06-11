import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { getClientIP, ipCache } from "./ipValidation";
import { getPublicIP, fetchIPInfo } from "./ipFetch";
import { addSecurityInfo, getClimateZone } from "./ipSecurity";

export const advancedIPController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Attempting to get client IP...');

    let clientIP = getClientIP(req);

    if (!clientIP) {
      console.log('No client IP found, trying public IP...');
      try {
        clientIP = await getPublicIP();
        console.log('Using public IP:', clientIP);
      } catch (error) {
        console.error('Failed to get public IP:', error);
        if (process.env.NODE_ENV === 'development') {
          clientIP = '8.8.8.8';
          console.log('Using development fallback IP:', clientIP);
        } else {
          return next(createError(400, "Unable to determine IP address"));
        }
      }
    }

    const cacheKey = `ip_info_${clientIP}`;
    let ipInfo = ipCache.get(cacheKey);

    if (!ipInfo) {
      ipInfo = await fetchIPInfo(clientIP);
      ipCache.set(cacheKey, ipInfo);
    }

    const enrichedInfo = addSecurityInfo(ipInfo, req);

    if (enrichedInfo.latitude) {
      enrichedInfo.climate_zone = getClimateZone(enrichedInfo.latitude);
    }

    res.status(200).json({
      success: true,
      message: "IP information fetched successfully",
      data: enrichedInfo,
      meta: {
        cached: ipCache.has(cacheKey),
        processing_time: Date.now() - (req as any).startTime,
        api_version: "2.0",
        rate_limit: {
          remaining: res.getHeaders()['x-ratelimit-remaining'],
          reset: res.getHeaders()['x-ratelimit-reset']
        }
      }
    });

  } catch (error: any) {
    console.error("Error in IP controller:", error);

    if (error.code === 'ENOTFOUND') {
      return next(createError(503, "IP lookup service unavailable"));
    } else if (error.code === 'ECONNABORTED') {
      return next(createError(408, "Request timeout - IP lookup service is slow"));
    } else if (error.response?.status === 429) {
      return next(createError(429, "IP lookup service rate limit exceeded"));
    } else {
      return next(createError(500, "Failed to fetch IP information"));
    }
  }
};
