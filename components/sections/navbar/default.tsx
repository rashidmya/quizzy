"use client";

//auth
import { signOut } from "next-auth/react";
// next
import Link from "next/link";
// icons
import { Menu, Sun, Moon } from "lucide-react";
// components
import Navigation from "../../ui/navigation";
import { Button } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../ui/sheet";
// paths
import { PATH_AUTH, PATH_DASHBOARD } from "@/routes/paths";
// next-theme
import { useTheme } from "next-themes";
// logo
import Github from "@/components/logos/github";
import LaunchUI from "../../logos/launch-ui";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Navbar() {
  const user = useCurrentUser();

  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 -mb-4 px-4 pb-4">
      <div className="fade-bottom bg-background/15 absolute left-0 h-16 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <LaunchUI />
              Quizzy
            </Link>
            <Navigation user={user} />
          </NavbarLeft>
          <NavbarRight>
            <Button variant="ghost" asChild>
              <Link
                href="https://github.com/rashidmya/quizzy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">View on GitHub</span>
              </Link>
            </Button>
            <Button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              variant="ghost"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle dark/light mode</span>
            </Button>
            <Sheet>
              <SheetTitle hidden>Quizzy App</SheetTitle>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>Quizzy</span>
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href={PATH_DASHBOARD.root}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        My Account
                      </Link>
                      <Link
                        href={PATH_DASHBOARD.root}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/"
                        onClick={(e) => {
                          e.preventDefault();
                          signOut({ redirect: true, callbackUrl: "/" });
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Logout
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={PATH_AUTH.login}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Sign In
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
