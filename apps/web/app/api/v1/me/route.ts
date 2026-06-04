import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUserId, unauthorized, ok } from "@/lib/api-auth";

/** GET /api/v1/me — 내 프로필 */
export async function GET(req: NextRequest) {
  const userId = await getApiUserId(req);
  if (!userId) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nickname: true, profileImage: true, createdAt: true },
  });

  if (!user) return unauthorized();

  return ok(user);
}
