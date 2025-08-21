import { NextRequest, NextResponse } from "next/server";
import { roomStore } from "@/app/server/roomStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const room = roomStore.ensureRoom(id);

    return NextResponse.json(
      {
        ok: true,
        id: room.id,
        status: room.status,
        players: room.players,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
