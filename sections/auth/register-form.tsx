"use client";

import { startTransition } from "react";
// next
import Link from "next/link";
import { useRouter } from "next/navigation";
// nextauth
import { signIn } from "next-auth/react";
// lib
import { cn } from "@/lib/utils";
import { useActionState } from "@/hooks/use-action-state";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// actions
import { createUser } from "@/actions/user";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm(
  props: React.ComponentPropsWithoutRef<"form">
) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [createState, createAction, isCreatePending] = useActionState(
    createUser,
    {
      message: "",
    }
  );

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Await the result of createUser.
      const result = await createAction(formData);

      // Check the result for an error.
      if (result.error) {
        return;
      }

      // If registration is successful, sign in.
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", props.className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-balance text-sm text-muted-foreground">
          {createState.error && (
            <span className="text-red-600">{createState.message}</span>
          )}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...register("email")}
            required
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your password"
            {...register("password")}
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register("confirmPassword")}
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isCreatePending}>
          {isCreatePending ? "Signing up..." : "Sign Up"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?
        <Link href="/auth/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}
