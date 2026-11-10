import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/constants";

export type SessionPayload = {
  userId: string;
  role: Role;
  name: string;
  email: string;
};

function secretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload, secret: string, maxAge: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), { algorithms: ["HS256"] });
    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "AUTHOR" && payload.role !== "ADMIN") ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string"
    ) return null;
    return {
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
