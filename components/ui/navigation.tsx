"use client";

import { forwardRef } from "react";
// next
import Link from "next/link";
// next-auth
import { signOut } from "next-auth/react";
// lib
import { cn } from "@/utils/cn";
// components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
// paths
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
// logo
import LaunchUI from "../logos/launch-ui";

export default function Navigation({ user }: {   user: {
  id: string
  email: string
  name: string
}}) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {user.id ? (
          <NavigationMenuItem>
            <NavigationMenuTrigger>{user.email}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/30 to-muted/10 p-6 no-underline outline-hidden focus:shadow-md"
                      href="/"
                    >
                      <LaunchUI />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        My Account
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Manage your account settings, update your profile, and
                        review your activity.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem
                  href={PATH_DASHBOARD.root}
                  title="Dashboard"
                >
                  Access your dashboard to oversee your quizzes.
                </ListItem>
                <ListItem
                  onClick={(e) => {
                    e.preventDefault();
                    signOut({ redirect: true, callbackUrl: "/" });
                  }}
                  href="/"
                  title="Logout"
                >
                  Sign out from your account.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ) : (
          <NavigationMenuItem>
            <Link href={PATH_AUTH.login} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Login
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        )}
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
