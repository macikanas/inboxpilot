import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      preferredAIProvider: true,
      preferredAIModel: true,
      emailAccounts: {
        where: { isActive: true },
        select: {
          id: true,
          email: true,
          provider: true,
          displayName: true,
          imapHost: true,
          isActive: true,
          lastSyncAt: true,
        },
      },
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { preferredAIProvider, preferredAIModel, firstName, lastName } = await req.json();

  const user = await db.user.update({
    where: { email: session.user.email },
    data: {
      ...(preferredAIProvider && { preferredAIProvider }),
      ...(preferredAIModel !== undefined && { preferredAIModel }),
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
    },
  });

  return NextResponse.json({ status: "updated", provider: user.preferredAIProvider });
}
