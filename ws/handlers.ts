import type { Server, Socket } from "socket.io";
import type { ClientToServer, ServerToClient, JoinRoom, DraftSnapshot } from "./events";
import { roomStore } from "@/app/server/roomStore";
import { getGame, ensureGame, applyPick } from "@/app/server/gameStore";

type Io = Server<ClientToServer, ServerToClient>;
type S = Socket<ClientToServer, ServerToClient>;

export function handleJoinRoom(io: Io, socket: S, { roomId, playerId }: JoinRoom) {
    console.log("JOIN ROOM CALLED", roomId, playerId);
    if (!roomId || !playerId) {
        socket.emit("ws_error", { code: "bad_payload", msg: "roomId and playerId required" });
        return;
    }

    const result = roomStore.join(roomId, playerId);

    if (!result.ok) {
        socket.emit("ws_error", { code: result.error, msg: "cannot join room" });
        return;
    }

    socket.join(roomId);
    console.log("emit room_state", roomId, result.room.players, result.room.status);
    io.to(roomId).emit("room_state", result.room);
}

export function handleGetRoom(io: Io, socket: S, { roomId }: { roomId: string }) {
    const room = roomStore.ensureRoom(roomId);
    socket.emit("room_state", room);
}

export function toDraftSnapshot(roomId: string): DraftSnapshot {
    const g = getGame(roomId);
    if (!g) throw new Error("game_not_found");

    const players = {
        p1: Object.keys(g.roleByPlayerId).find(pid => g.roleByPlayerId[pid] === "p1")!,
        p2: Object.keys(g.roleByPlayerId).find(pid => g.roleByPlayerId[pid] === "p2")!,
    };

    const remaining = g.pool.filter(name => !g.used.has(name));

    return {
        roomId: g.id,
        status: g.phase === "draft" ? "draft" : "finished",
        players,
        pool: g.pool,
        picks: { p1: g.decks.p1, p2: g.decks.p2 },
        turn: g.current,
        pickIndex: g.pickIndex,
        timer: g.timer
    };
}

export function handleGameEnsure(io: Io, socket: S, { roomId }: { roomId: string }) {
    const room = roomStore.ensureRoom(roomId);
    if (room.players.length !== 2) {
        socket.emit("ws_error", { code: "bad_payload", msg: "room not ready" });
        return;
    }
    ensureGame(roomId, { players: room.players });
    io.to(roomId).emit("draft_state", toDraftSnapshot(roomId));
    startTimer(io, roomId);
}

export function handleDraftRequestState(io: Io, socket: S, { roomId }: { roomId: string }) {
    const g = getGame(roomId);
    if (!g) {
        socket.emit("ws_error", { code: "game_not_found", msg: "no game for room" });
        return;
    }
    socket.emit("draft_state", toDraftSnapshot(roomId));
}

export function handleDraftPick(
    io: Io,
    socket: S,
    { roomId, playerId, card }: { roomId: string; playerId: string; card: string }
) {
    if (!roomId || !playerId || !card) {
        socket.emit("ws_error", { code: "bad_payload", msg: "roomId/playerId/card required" });
        return;
    }

    try {
        applyPick(roomId, playerId, card);
        io.to(roomId).emit("draft_state", toDraftSnapshot(roomId));
        startTimer(io, roomId);
    } catch (e: any) {
        const msg = String(e?.message || e);
        socket.emit("ws_error", { code: "bad_payload", msg });
    }
}

function startTimer(io: Io, roomId: string) {
    const g = getGame(roomId);
    if (!g || g.phase !== "draft") return;

    if (g.timeout) clearTimeout(g.timeout);

    const durationMs = (g.timer ?? 15)*1000;

    g.timeout = setTimeout(() => {
        if (g.phase !== "draft") return;

        const { who } = g.schedule[g.turnIndex];
        const available = g.pool.filter(c => !g.used.has(c));
        if (available.length === 0) return;

        const randomCard = available[Math.floor(Math.random() * available.length)];
        const playerId = Object.entries(g.roleByPlayerId).find(([_, r]) => r === who)?.[0];
        if (!playerId) return;

        try {
            applyPick(roomId, playerId, randomCard);
            startTimer(io, roomId);
            io.to(roomId).emit("draft_state", toDraftSnapshot(roomId));
        } catch (e) {
            console.error("auto-pick failed", e);
        }
    }, durationMs);
}


