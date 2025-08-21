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

class RoomStore {
    private rooms = new Map<string, Room>();

    ensureRoom(id: string): Room {
        let room = this.rooms.get(id);
        if (!room) {
            room = { id, players: [], status: "waiting", lastActivityAt: Date.now() };
            this.rooms.set(id, room);
        }
        return room;
    }

    join(id: string, playerId: string): JoinResult {
        const room = this.ensureRoom(id);

        const idx = room.players.indexOf(playerId);
        if (idx !== -1) {
            room.lastActivityAt = Date.now();
            return { ok: true, room, youAre: idx === 0 ? "p1" : "p2", reason: "reconnect" };
        }

        if (room.players.length < 2) {
            room.players.push(playerId);
            room.status = room.players.length === 2 ? "ready" : "waiting";
            room.lastActivityAt = Date.now();
            const youAre = room.players.length === 1 ? "p1" : "p2";
            return { ok: true, room, youAre, reason: "joined" };
        }

        return { ok: false, error: "room_full" };
    }
}

export const roomStore = new RoomStore();

