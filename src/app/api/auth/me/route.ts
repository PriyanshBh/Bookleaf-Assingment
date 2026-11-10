import { getSession } from "@/lib/auth";
import { apiSuccess } from "@/lib/api";

export async function GET() {
  return apiSuccess(await getSession());
}
