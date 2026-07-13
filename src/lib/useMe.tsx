"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type MeUser = { id: string; name: string; email: string; role: "principal" | "manager" | "associate"; emailVerified: boolean };
export type MeFirm = { id: string; name: string; plan: { tier: string; status: string }; billingEmail: string; phone: string; pralApiUrl: string } | null;

interface MeState {
  user: MeUser | null;
  firm: MeFirm;
  loading: boolean;
  /** Re-fetch after something changes the profile (e.g. saving settings). */
  refresh: () => Promise<void>;
}

const MeContext = createContext<MeState>({ user: null, firm: null, loading: true, refresh: async () => {} });

/**
 * Fetches /api/auth/me exactly once per dashboard session and shares the
 * result via context, instead of every page/banner/layout independently
 * re-fetching it (which caused visible re-render/"reload" flicker as each
 * copy resolved at a slightly different time).
 */
export function MeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [firm, setFirm] = useState<MeFirm>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const d = await res.json();
      setUser(d.user || null);
      setFirm(d.firm || null);
    } catch {
      /* keep last-known values on transient network errors */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <MeContext.Provider value={{ user, firm, loading, refresh }}>{children}</MeContext.Provider>;
}

export function useMe() {
  return useContext(MeContext);
}
