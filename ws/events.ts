import type { Room } from "@/app/server/types";

export type ErrorCode =
    | "room_full"
    | "bad_payload"
    | "not_in_room"
    | "game_not_found"
    | "phase_mismatch"
    | "not_your_turn"
    | "card_taken"
    | "bad_card";

export type JoinRoom = { roomId: string; playerId: string };

export type DraftSnapshot = {
    roomId: string;
    status: "draft" | "ready_to_play" | "finished";
    players: { p1: string; p2: string };
    pool: string[];
    picks: { p1: string[]; p2: string[] };
    turn: "p1" | "p2";
    pickIndex: number;
    timer: number;
};

export type ClientToServer = {
    join_room: (payload: JoinRoom) => void;
    draft_request_state: (payload: { roomId: string }) => void;
    draft_pick: (payload: { roomId: string; playerId: string; card: string }) => void;
};

export type ServerToClient = {
    room_state: (room: Room) => void;
    draft_state: (snap: DraftSnapshot) => void;
    ws_error: (e: { code: ErrorCode; msg: string }) => void;
    pong: (m: { ok: boolean; echo?: unknown }) => void;
};
