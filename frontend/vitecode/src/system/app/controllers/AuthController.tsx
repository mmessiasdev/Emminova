/**
 * CONTROLLER LAYER — Auth context provides login/register/logout
 * and loads profile + enterprise on mount.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  authApi,
  profileApi,
  enterpriseApi,
  type AuthResponse,
  type StrapiUser,
  type Profile,
  type Enterprise,
} from "@app/models/api";

interface AuthState {
  jwt: string | null;
  user: StrapiUser | null;
  profile: Profile | null;
  enterprise: Enterprise | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshEnterprise: () => Promise<void>;
  setProfile: (p: Profile) => void;
  setEnterprise: (e: Enterprise) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    jwt: localStorage.getItem("jwt"),
    user: null,
    profile: null,
    enterprise: null,
    loading: true,
  });

  const persist = (jwt: string) => {
    localStorage.setItem("jwt", jwt);
  };

  const loadUserData = useCallback(async () => {
    try {
      const user = await authApi.me();
      const profiles = await profileApi.getByUser(user.id);
      const profile = profiles.length > 0 ? profiles[0] : null;

      let enterprise: Enterprise | null = null;
      if (profile && profile.enterprise) {
        enterprise = profile.enterprise;
      } else if (profile) {
        const enterprises = await enterpriseApi.getByProfile(profile.id);
        enterprise = enterprises.length > 0 ? enterprises[0] : null;
      }

      setState((s) => ({ ...s, user, profile, enterprise, loading: false }));
    } catch {
      localStorage.removeItem("jwt");
      setState({ jwt: null, user: null, profile: null, enterprise: null, loading: false });
    }
  }, []);

  useEffect(() => {
    if (state.jwt) {
      loadUserData();
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [state.jwt, loadUserData]);

  const login = async (identifier: string, password: string) => {
    const res = await authApi.login(identifier, password);
    persist(res.jwt);
    setState((s) => ({ ...s, jwt: res.jwt, user: res.user }));
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await authApi.register(username, email, password);
    persist(res.jwt);
    setState((s) => ({ ...s, jwt: res.jwt, user: res.user }));
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setState({ jwt: null, user: null, profile: null, enterprise: null, loading: false });
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const profiles = await profileApi.getByUser(state.user.id);
    const profile = profiles.length > 0 ? profiles[0] : null;
    setState((s) => ({ ...s, profile }));
  };

  const refreshEnterprise = async () => {
    if (!state.profile) return;
    let enterprise = state.profile.enterprise || null;
    if (!enterprise) {
      const enterprises = await enterpriseApi.getByProfile(state.profile.id);
      enterprise = enterprises.length > 0 ? enterprises[0] : null;
    }
    setState((s) => ({ ...s, enterprise }));
  };

  const setProfile = (p: Profile) => setState((s) => ({ ...s, profile: p }));
  const setEnterprise = (e: Enterprise) => setState((s) => ({ ...s, enterprise: e }));

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        ...state,
        login,
        register,
        logout,
        refreshProfile,
        refreshEnterprise,
        setProfile,
        setEnterprise,
      },
    },
    children
  );
};
