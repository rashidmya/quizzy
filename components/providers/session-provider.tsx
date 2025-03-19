"use client";

import {
  SessionProvider as NextSessionProvider,
  SessionProviderProps,
} from "next-auth/react";

export function SessionProvider({
  children,
  ...props
}: SessionProviderProps & { children: React.ReactNode }) {
  return <NextSessionProvider {...props}>{children}</NextSessionProvider>;
}