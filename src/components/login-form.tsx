"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = async (values: LoginValues) => {
    setServerError("");
    try {
      const result = await apiFetch<{ redirectTo: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(values) });
      router.replace(result.redirectTo);
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  };
  const fillDemo = (role: "author" | "admin") => {
    setValue("email", role === "admin" ? "admin@bookleaf.demo" : "priya.sharma@email.com", { shouldValidate: true });
    setValue("password", "BookLeafDemo!2026", { shouldValidate: true });
  };

  return <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
    <div><label className="label" htmlFor="email">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 size-4 text-[#8A918B]" /><input id="email" type="email" autoComplete="email" className="field pl-9" placeholder="you@example.com" {...register("email")} /></div>{errors.email && <p className="mt-1.5 text-xs text-[#A33B32]">{errors.email.message}</p>}</div>
    <div><label className="label" htmlFor="password">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-3 size-4 text-[#8A918B]" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="field px-9" placeholder="Enter your password" {...register("password")} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2.5 top-2.5 rounded p-1 text-[#7A817B]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{errors.password && <p className="mt-1.5 text-xs text-[#A33B32]">{errors.password.message}</p>}</div>
    {serverError && <div role="alert" className="rounded-lg border border-[#EDD2CD] bg-[#FCF2F0] px-3 py-2.5 text-sm text-[#934238]">{serverError}</div>}
    <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="size-4 animate-spin" />}{isSubmitting ? "Signing in…" : "Sign in"}</Button>
    <div className="relative py-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-[#8A918B]">Demo access</span></div></div>
    <div className="grid grid-cols-2 gap-2"><Button type="button" variant="secondary" onClick={() => fillDemo("author")}>Use author</Button><Button type="button" variant="secondary" onClick={() => fillDemo("admin")}>Use admin</Button></div>
  </form>;
}
