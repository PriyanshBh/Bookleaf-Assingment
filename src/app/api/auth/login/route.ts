import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin, rateLimit, ApiError } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimit(`login:${ip}`, 10, 15 * 60_000);
    const input = loginSchema.parse(await request.json());
    await connectToDatabase();
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new ApiError(401, "The email or password is incorrect.", "INVALID_CREDENTIALS");
    }
    await createSession({ userId: user._id.toString(), role: user.role, name: user.name, email: user.email });
    return apiSuccess({ role: user.role, redirectTo: user.role === "ADMIN" ? "/admin" : "/author" });
  } catch (error) {
    return apiError(error);
  }
}
