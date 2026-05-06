"use server";

import { createServerSupabaseClient } from "@/lib/supabase_server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.log(error);
    console.error("Signup error:", error.message);
    redirect("/signup?error=Signup failed");
  }

  redirect("/login");
}

export async function signIn(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log(error);
    console.error("Login error:", error.message);
    redirect("/login?error=Invalid credentials");
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();
  redirect("/login");
}
