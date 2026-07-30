import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../shared/env";

export interface TokenUser {
  _id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      tokenUser?: TokenUser;
    }
  }
}

export function extractTokenUser(req: Request): TokenUser | null {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && (req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (!token || !env.JWT_ACCESS_SECRET) return null;

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; email: string; role: string };
    return { _id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = extractTokenUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.tokenUser = user;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.tokenUser = extractTokenUser(req) ?? undefined;
  next();
}

