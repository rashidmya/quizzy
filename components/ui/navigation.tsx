"use client";

import { forwardRef } from "react";
// next
import Link from "next/link";
// next-auth
import { signOut } from "next-auth/react";
// lib
import { cn } from "@/lib/utils";
// components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
// paths
import { PATH_AUTH } from "@/routes/paths";

export default function Navigation({ user }: { user?: any }) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          {user ? (
            <Link href="" legacyBehavior passHref>
              <NavigationMenuLink
                onClick={(e) => {
                  e.preventDefault();
                  signOut({ redirect: true, callbackUrl: "/" });
                }}
                className={navigationMenuTriggerStyle()}
              >
                Sign Out
              </NavigationMenuLink>
            </Link>
          ) : (
            <Link href={PATH_AUTH.login} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Login
              </NavigationMenuLink>
            </Link>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
