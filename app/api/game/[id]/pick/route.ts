import { NextRequest, NextResponse } from "next/server";
import { applyPick } from "@/app/server/gameStore";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { playerId, card } = await req.json();

    if (!playerId || !card) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    const g = applyPick(id, playerId, card);

    return NextResponse.json({ ok: true, game: g }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "server_error" },
      { status: 500 }
    );
  }
}
