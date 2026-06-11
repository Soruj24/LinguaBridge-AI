import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { isValidIP, ipCache } from "./ipValidation";
import { fetchIPInfo } from "./ipFetch";

export const bulkIPController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ips } = req.body;

    if (!Array.isArray(ips) || ips.length === 0) {
      return next(createError(400, "Please provide an array of IP addresses"));
    }

    if (ips.length > 10) {
      return next(createError(400, "Maximum 10 IPs allowed per request"));
    }

    const results = await Promise.allSettled(
      ips.map(async (ip: string) => {
        if (!isValidIP(ip)) {
          throw new Error(`Invalid IP address: ${ip}`);
        }

        const cacheKey = `ip_info_${ip}`;
        let ipInfo = ipCache.get(cacheKey);

        if (!ipInfo) {
          ipInfo = await fetchIPInfo(ip);
          ipCache.set(cacheKey, ipInfo);
        }

        return { ip, data: ipInfo, status: 'success' };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value);
    const failed = results.filter(r => r.status === 'rejected').map((r, index) => ({
      ip: ips[index],
      error: (r as any).reason.message,
      status: 'failed'
    }));

    res.status(200).json({
      success: true,
      message: `Processed ${ips.length} IP addresses`,
      data: {
        successful,
        failed,
        summary: {
          total: ips.length,
          success_count: successful.length,
          failed_count: failed.length
        }
      }
    });

  } catch (error) {
    console.error("Error in bulk IP controller:", error);
    next(createError(500, "Failed to process bulk IP lookup"));
  }
};
