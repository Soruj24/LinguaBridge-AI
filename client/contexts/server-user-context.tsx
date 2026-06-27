"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface ServerUser {
  email: string;
  name: string;
  avatar: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  serverUser: ServerUser | null;
  isLoading: boolean;
  tokens: TokenPair | null;
}

const AuthContext = createContext<AuthContextValue>({
  serverUser: null,
  isLoading: true,
  tokens: null,
});

export const useServerUser = () => useContext(AuthContext);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
}

function setAuthHeader(token: string | null) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

export function ServerUserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncedRef = useRef(false);

  const syncAuth = useCallback(async (user: { email: string; name?: string; image?: string }) => {
    try {
      const res = await fetch("/api/friends/auth-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          avatar: user.image,
          provider: user.image ? "google" : "github",
          providerId: user.email,
        }),
      });
      const data = await res.json();
      if (data.accessToken) {
        const t: TokenPair = { accessToken: data.accessToken, refreshToken: data.refreshToken };
        setTokens(t);
        setAuthHeader(t.accessToken);
        setServerUser({
          email: user.email,
          name: data.user?.displayName || user.name || "",
          avatar: data.user?.avatar?.url || user.image || "",
        });
      }
    } catch (e) {
      console.error("Auth sync failed:", e);
    } finally {
      setIsLoading(false);
      syncedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.email && !syncedRef.current) {
      syncAuth(session.user as { email: string; name?: string; image?: string });
    } else if (!session?.user) {
      setTokens(null);
      setServerUser(null);
      setAuthHeader(null);
      setIsLoading(false);
    }
  }, [session, status, syncAuth]);

  // Axios interceptor: auto-refresh on 401
  const tokensRef = useRef<TokenPair | null>(null);
  tokensRef.current = tokens;

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return axios(originalRequest);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const currentTokens = tokensRef.current;
            if (!currentTokens?.refreshToken) throw new Error("No refresh token");
            const res = await fetch("/api/friends/refresh-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
            });
            const data = await res.json();
            if (data.accessToken) {
              const newTokens: TokenPair = { accessToken: data.accessToken, refreshToken: data.refreshToken };
              setTokens(newTokens);
              setAuthHeader(newTokens.accessToken);
              processQueue(null);
              originalRequest.headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            processQueue(refreshError);
            setTokens(null);
            setAuthHeader(null);
          } finally {
            isRefreshing = false;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ serverUser, isLoading, tokens }}>
      {children}
    </AuthContext.Provider>
  );
}
