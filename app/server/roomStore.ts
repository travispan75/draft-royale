import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Redis } from "@upstash/redis";

export type RoomStatus = "waiting" | "ready";

export type Room = {
    id: string;
    players: string[];
    status: RoomStatus;
    lastActivityAt: number;
};

export type JoinResult =
    | { ok: true; room: Room; youAre: "p1" | "p2"; reason: "joined" | "reconnect" }
    | { ok: false; error: "room_full" };

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_KEY = (id: string) => `room:${id}`;

async function saveRoom(room: Room) {
    await redis.set(ROOM_KEY(room.id), room);
}

async function loadRoom(id: string): Promise<Room | null> {
    return await redis.get<Room>(ROOM_KEY(id));
}

class RoomStore {
    async ensureRoom(id: string): Promise<Room> {
        let room = await loadRoom(id);
        if (!room) {
            room = { id, players: [], status: "waiting", lastActivityAt: Date.now() };
            await saveRoom(room);
        }
        return room;
    }

    async join(id: string, playerId: string): Promise<JoinResult> {
        let room = await this.ensureRoom(id);

        const idx = room.players.indexOf(playerId);
        if (idx !== -1) {
            room.lastActivityAt = Date.now();
            await saveRoom(room);
            return { ok: true, room, youAre: idx === 0 ? "p1" : "p2", reason: "reconnect" };
        }

        if (room.players.length < 2) {
            room.players.push(playerId);
            room.status = room.players.length === 2 ? "ready" : "waiting";
            room.lastActivityAt = Date.now();
            const youAre = room.players.length === 1 ? "p1" : "p2";
            await saveRoom(room);
            return { ok: true, room, youAre, reason: "joined" };
        }

        return { ok: false, error: "room_full" };
    }
}

export const roomStore = new RoomStore();
