import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import Subscription from "../../models/Subscription";

export const hasActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return next(createHttpError(401, "Authentication required"));
    }

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ["active", "trialing"] },
      currentPeriodEnd: { $gt: new Date() },
    });

    if (!subscription) {
      return next(createHttpError(403, "Active subscription required"));
    }

    (req as any).subscription = subscription;
    next();
  } catch (error) {
    next(createHttpError(500, "Failed to check subscription status"));
  }
};

export const hasPlan = (requiredPlanId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id;
      
      if (!userId) {
        return next(createHttpError(401, "Authentication required"));
      }

      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ["active", "trialing"] },
        currentPeriodEnd: { $gt: new Date() },
      }).populate("planId");

      if (!subscription) {
        return next(createHttpError(403, "Active subscription required"));
      }

      if (subscription.planId?.toString() !== requiredPlanId) {
        return next(createHttpError(403, `Plan ${requiredPlanId} required`));
      }

      (req as any).subscription = subscription;
      next();
    } catch (error) {
      next(createHttpError(500, "Failed to check plan access"));
    }
  };
};

export const hasFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id;
      
      if (!userId) {
        return next(createHttpError(401, "Authentication required"));
      }

      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ["active", "trialing"] },
        currentPeriodEnd: { $gt: new Date() },
      }).populate("planId");

      if (!subscription) {
        return next(createHttpError(403, "Active subscription required"));
      }

      const planFeatures = (subscription.planId as any)?.features || [];
      
      if (!planFeatures.includes(feature)) {
        return next(createHttpError(403, `Feature "${feature}" not available in your plan`));
      }

      (req as any).subscription = subscription;
      next();
    } catch (error) {
      next(createHttpError(500, "Failed to check feature access"));
    }
  };
};

export const checkStorageLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    const fileSize = parseInt(req.headers["content-length"] || "0", 10);
    
    if (!userId || fileSize === 0) {
      return next();
    }

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ["active", "trialing"] },
    }).populate("planId");

    if (!subscription) {
      return next(createHttpError(403, "Active subscription required"));
    }

    const storageLimit = (subscription.planId as any)?.storageLimit || 0;
    const currentUsage = 0;
    
    if (currentUsage + fileSize > storageLimit) {
      return next(createHttpError(403, "Storage limit exceeded"));
    }

    (req as any).subscription = subscription;
    next();
  } catch (error) {
    next(createHttpError(500, "Failed to check storage limit"));
  }
};

export const planBasedRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return next();
    }

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ["active", "trialing"] },
    }).populate("planId");

    if (!subscription) {
      return next();
    }

    const planId = (subscription.planId as any)?.id;
    const apiCallLimit = (subscription.planId as any)?.apiCallLimit || 1000;
    
    (req as any).subscription = subscription;
    next();
  } catch (error) {
    next(createHttpError(500, "Failed to apply rate limits"));
  }
};
