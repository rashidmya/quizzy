"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { hash } from "bcrypt-ts";
import { getUser } from "@/lib/db/queries/users";

export async function createUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate that both email and password are provided.
  if (!email?.trim() || !password?.trim()) {
    return { message: "Email and password are required", error: true };
  }

  if (!firstName?.trim() || !lastName?.trim()) {
    return { message: "Email and password are required", error: true };
  }

  // Validate if user doesnt exist
  const existingUser = await getUser(email);
  if (existingUser.length > 0) {
    return { message: "User already exists", error: true };
  }

  const name = `${firstName.trim()} ${lastName.trim()}`;

  // Hash the password before storing it in the database.
  const hashedPassword = await hash(password, 10);

  // Insert the new user into the users table.
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Revalidate the home page (or any other page that depends on this data).
  revalidatePath("/dashboard");

  return { message: "User created successfully" };
}
