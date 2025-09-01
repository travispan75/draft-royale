import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient, JoinRoom, DraftSnapshot } from "./events";
import { roomStore } from "@/app/server/roomStore";
import { getGame, ensureGame, applyPick } from "@/app/server/gameStore";

type Io = Server<ClientToServer, ServerToClient>;
type S = Socket<ClientToServer, ServerToClient>;

export async function handleJoinRoom(io: Io, socket: S, { roomId, playerId }: JoinRoom) {
    if (!roomId || !playerId) {
        socket.emit("ws_error", { code: "bad_payload", msg: "roomId and playerId required" });
        return;
    }

    const result = await roomStore.join(roomId, playerId);
    if (!result.ok) {
        socket.emit("ws_error", { code: result.error, msg: "cannot join room" });
        return;
    }

    socket.join(roomId);
    io.to(roomId).emit("room_state", result.room);
}

export async function handleGetRoom(io: Io, socket: S, { roomId }: { roomId: string }) {
    const room = await roomStore.ensureRoom(roomId);
    socket.emit("room_state", room);
}

export async function toDraftSnapshot(roomId: string): Promise<DraftSnapshot> {
    const g = await getGame(roomId);
    if (!g) throw new Error("game_not_found");

    const players = {
        p1: Object.keys(g.roleByPlayerId).find(pid => g.roleByPlayerId[pid] === "p1")!,
        p2: Object.keys(g.roleByPlayerId).find(pid => g.roleByPlayerId[pid] === "p2")!,
    };

    return {
        roomId: g.id,
        status: g.phase,
        players,
        pool: g.pool,
        picks: { p1: g.decks.p1, p2: g.decks.p2 },
        turn: g.current,
        pickIndex: g.pickIndex,
        timer: g.timer ?? 15,
        turnDeadline: g.turnDeadline ?? null,
        serverNow: Date.now(),
    };
}

export async function handleGameEnsure(io: Io, socket: S, { roomId }: { roomId: string }) {
    const room = await roomStore.ensureRoom(roomId);
    if (room.players.length !== 2) {
        socket.emit("ws_error", { code: "bad_payload", msg: "room not ready" });
        return;
    }

    let g = await getGame(roomId);
    if (!g) {
        g = await ensureGame(roomId, { players: room.players });
        startTimer(io, roomId);
    }

    socket.emit("draft_state", await toDraftSnapshot(roomId));
}

export async function handleDraftRequestState(io: Io, socket: S, { roomId }: { roomId: string }) {
    const g = await getGame(roomId);
    if (!g) {
        socket.emit("ws_error", { code: "game_not_found", msg: "no game for room" });
        return;
    }
    socket.emit("draft_state", await toDraftSnapshot(roomId));
}

export async function handleDraftPick(
    io: Io,
    socket: S,
    { roomId, playerId, card }: { roomId: string; playerId: string; card: string }
) {
    if (!roomId || !playerId || !card) {
        socket.emit("ws_error", { code: "bad_payload", msg: "roomId/playerId/card required" });
        return;
    }

    try {
        await applyPick(roomId, playerId, card);
        startTimer(io, roomId);
        io.to(roomId).emit("draft_state", await toDraftSnapshot(roomId));
    } catch (e: any) {
        const msg = String(e?.message || e);
        socket.emit("ws_error", { code: "bad_payload", msg });
    }
}

async function startTimer(io: Io, roomId: string) {
    const g = await getGame(roomId);
    if (!g || g.phase !== "draft") return;

    if (g.timeout) clearTimeout(g.timeout);

    const durationMs = (g.timer ?? 15) * 1000;
    g.turnDeadline = Date.now() + durationMs;

    g.timeout = setTimeout(async () => {
        const g2 = await getGame(roomId);
        if (!g2 || g2.phase !== "draft") return;

        const { who } = g2.schedule[g2.turnIndex];
        const available = g2.pool.filter(c => !g2.used.has(c));
        if (available.length === 0) return;

        const randomCard = available[Math.floor(Math.random() * available.length)];
        const playerId = Object.entries(g2.roleByPlayerId).find(([_, r]) => r === who)?.[0];
        if (!playerId) return;

        try {
            await applyPick(roomId, playerId, randomCard);
            startTimer(io, roomId);
            io.to(roomId).emit("draft_state", await toDraftSnapshot(roomId));
        } catch (e) {
            console.error("auto-pick failed", e);
        }
    }, durationMs);
}
