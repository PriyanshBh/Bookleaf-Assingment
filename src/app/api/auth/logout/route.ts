import { destroySession } from "@/lib/auth";
import { apiError, apiSuccess, assertSameOrigin } from "@/lib/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroySession();
    return apiSuccess({ loggedOut: true });
  } catch (error) {
    return apiError(error);
  }
}
