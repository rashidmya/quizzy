import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session } = useSession();
  const user = session?.user;
  return {
    id: user?.id || "",
    email: user?.email || "",
    name: user?.name || "",
  };
}
