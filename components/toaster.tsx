"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      duration={5000}
      position="top-right"
      richColors
      theme={resolvedTheme as ToasterProps["theme"]}
      closeButton
    />
  );
}
