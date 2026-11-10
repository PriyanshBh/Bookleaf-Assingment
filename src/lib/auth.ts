import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, type Role } from "@/lib/constants";
import { getServerEnv } from "@/lib/env";
import { signSessionToken, verifySessionToken, type SessionPayload } from "@/lib/session-token";

export async function createSession(payload: SessionPayload) {
  const env = getServerEnv();
  const token = await signSessionToken(payload, env.JWT_SECRET, SESSION_MAX_AGE_SECONDS);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token, getServerEnv().JWT_SECRET);
}

export async function requireSession(role?: Role) {
  const session = await getSession();
  if (!session || (role && session.role !== role)) return null;
  return session;
}

export async function requirePageSession(role: Role) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect(session.role === "ADMIN" ? "/admin" : "/author");
  return session;
}
