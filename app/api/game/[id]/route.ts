import { NextRequest, NextResponse } from "next/server";
import { ensureGame } from "@/app/server/gameStore";
import { roomStore } from "@/app/server/roomStore";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const room = roomStore.ensureRoom(id);
        if (room.players.length < 2 || room.status !== "ready") {
            return NextResponse.json(
                { ok: false, error: "waiting_for_opponent" },
                { status: 409 }
            );
        }
        const game = ensureGame(id, room);
        return NextResponse.json({ ok: true, game }, { status: 200 });
    } catch {
        return NextResponse.json(
            { ok: false, error: "server_error" },
            { status: 500 }
        );
    }
}
