"use client";

import { useState } from "react";
import Link from "next/link";
// lib
import { cn } from "@/lib/utils";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// next-auth
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm(
  props: React.ComponentPropsWithoutRef<"form">
) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    await signIn("credentials", {
      ...data,
      redirect: true,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", props.className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            required
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="mr-2 h-4 w-4"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.9 0 6.9 1.7 9 3.1l6.6-6.6C33.7 3.3 29.2 1 24 1 14.8 1 6.8 5.9 2.7 13.4l7.7 6c1.8-5 6.7-8.4 12.6-8.4z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.5c-.5 3.1-2 5.7-4.2 7.5l6.7 5.2C43.7 36 46.1 30.5 46.1 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.4 28.9a14.03 14.03 0 0 1 0-9.8l-7.7-6A23.97 23.97 0 0 0 1 24c0 3.8.9 7.4 2.4 10.4l7.7-6z"
            />
            <path
              fill="#34A853"
              d="M24 47c6.2 0 11.4-2.1 15.2-5.8l-7.2-6.1c-2 1.4-4.6 2.2-8 2.2-6.1 0-11.3-4.1-13.2-9.7H2.4l-7.7 6C6.8 42.1 14.8 47 24 47z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Login with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
