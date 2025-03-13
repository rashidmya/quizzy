"use client";

import { SnackbarProvider as NextNotistackProvider } from "notistack";

export function NotistackProvider({ children }: { children: React.ReactNode }) {
  return <NextNotistackProvider anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>{children}</NextNotistackProvider>;
}
