// =====================================================================================
// Step 2 of Admin login: verify the 6-digit code the admin received by email against
// the signed challenge token from step 1.
// =====================================================================================
import { verifyChallengeToken } from "@/lib/otp";

export async function POST(request) {
  const { token, otp } = await request.json().catch(() => ({}));
  const result = verifyChallengeToken(token, otp);

  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 401 });
  }

  return Response.json({ ok: true, email: result.email });
}
