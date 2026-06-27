import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

export async function proxyToServer(req: NextRequest, serverPath: string, accessToken?: string) {
  try {
    const body = req.method !== "GET" ? await req.text() : undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (req.headers.get("cookie")) {
      headers["cookie"] = req.headers.get("cookie")!;
    }
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${SERVER_URL}${serverPath}`, {
      method: req.method,
      headers,
      body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach server" },
      { status: 500 }
    );
  }
}

export async function proxyWithAuth(req: NextRequest, serverPath: string) {
  const session = await auth();
  const token = (session as any)?.accessToken;
  return proxyToServer(req, serverPath, token);
}
