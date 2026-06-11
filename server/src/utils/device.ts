import { Request } from "express";

export const getDeviceInfo = (req: Request): string => {
  const userAgent = req.headers["user-agent"] || "Unknown";

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return "Mobile";
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return "Tablet";
  } else {
    return "Desktop";
  }
};
