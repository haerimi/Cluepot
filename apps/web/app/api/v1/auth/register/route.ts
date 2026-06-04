import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, ok } from "@/lib/api-auth";

/** POST /api/v1/auth/register — 회원가입 시 Prisma user 생성 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.email || !body?.nickname) return badRequest("필수 항목 누락");

  await prisma.user.upsert({
    where: { id: body.id },
    update: {},
    create: { id: body.id, email: body.email, nickname: body.nickname },
  });

  return ok({ ok: true }, 201);
}
