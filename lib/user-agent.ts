export function parseUserAgent(userAgent: string): {
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();
  
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "unknown";
  let browser = "Unknown";
  let os = "Unknown";

  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    deviceType = "desktop";
  }

  if (/edge\/([\d.]+)/i.test(ua)) {
    browser = "Edge";
  } else if (/opr\/([\d.]+)/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome\/([\d.]+)/i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox\/([\d.]+)/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari\/([\d.]+)/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/msie|trident/i.test(ua)) {
    browser = "Internet Explorer";
  }

  if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  }

  return { deviceType, browser, os };
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  return "127.0.0.1";
}

export function formatDeviceInfo(deviceType: string, browser: string, os: string): string {
  if (deviceType === "mobile" || deviceType === "tablet") {
    return `${os} ${browser}`;
  }
  return `${os} - ${browser}`;
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
}