import { NextRequest, NextResponse } from "next/server";
import { roomStore } from "@/app/server/roomStore";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { playerId } = await req.json();

    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    const result = roomStore.join(id, playerId);

    if (!result.ok && result.error === "room_full") {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
