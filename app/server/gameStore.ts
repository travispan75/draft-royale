import { CARDS } from "@/data/card";
import { Redis } from "@upstash/redis";

export type GameState = {
    id: string;
    phase: "draft" | "finished";
    pool: string[];
    used: Set<string>;
    decks: { p1: string[]; p2: string[] };
    first: "p1" | "p2";
    current: "p1" | "p2";
    schedule: Array<{ who: "p1" | "p2"; count: 1 | 2 }>;
    turnIndex: number;
    pickIndex: number;
    roleByPlayerId: Record<string, "p1" | "p2">;
    timer: number;
    timeout?: NodeJS.Timeout;
    turnDeadline?: number;
};

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function saveGame(game: GameState) {
    await redis.set(game.id, {
        ...game,
        used: Array.from(game.used),
    });
}

async function loadGame(id: string): Promise<GameState | null> {
    const raw = await redis.get<any>(id);
    if (!raw) return null;
    return {
        ...raw,
        used: new Set(raw.used),
    } as GameState;
}

export async function initGame(id: string, room: { players: string[] }): Promise<GameState> {
    const allNames = CARDS.map(c => c.name);
    const pool = allNames.sort(() => Math.random() - 0.5).slice(0, 36);
    const firstPick = Math.random() < 0.5 ? "p1" : "p2";
    const other: "p1" | "p2" = firstPick === "p1" ? "p2" : "p1";
    const schedule: Array<{ who: "p1" | "p2"; count: 1 | 2 }> = [
        { who: firstPick, count: 1 },
        { who: other, count: 2 },
        { who: firstPick, count: 2 },
        { who: other, count: 2 },
        { who: firstPick, count: 2 },
        { who: other, count: 2 },
        { who: firstPick, count: 2 },
        { who: other, count: 1 },
        { who: firstPick, count: 1 },
        { who: other, count: 1 },
    ];
    const g: GameState = {
        id,
        phase: "draft",
        pool,
        used: new Set(),
        decks: { p1: [], p2: [] },
        first: firstPick,
        current: firstPick,
        schedule,
        turnIndex: 0,
        pickIndex: 0,
        roleByPlayerId: {
            [room.players[0]]: "p1",
            [room.players[1]]: "p2",
        },
        timer: 15,
    };
    await saveGame(g);
    return g;
}

export async function ensureGame(id: string, room: { players: string[] }) {
    let g = await loadGame(id);
    if (!g) g = await initGame(id, room);
    return g;
}

export async function getGame(id: string) {
    return await loadGame(id);
}

export async function applyPick(id: string, playerId: string, card: string) {
    const g = await loadGame(id);
    if (!g) throw new Error("game_not_found");

    const role = g.roleByPlayerId[playerId];
    if (!role) throw new Error("invalid_player");
    if (role !== g.current) throw new Error("not_your_turn");

    if (!g.pool.includes(card)) throw new Error("invalid_card");
    if (g.used.has(card)) throw new Error("card_already_taken");

    g.decks[role].push(card);
    g.used.add(card);

    g.pickIndex++;
    const { who, count } = g.schedule[g.turnIndex];

    if (g.pickIndex >= count) {
        g.turnIndex++;
        g.pickIndex = 0;
        if (g.turnIndex < g.schedule.length) {
            g.current = g.schedule[g.turnIndex].who;
        } else {
            g.phase = "finished";
        }
    }

    await saveGame(g);
    return g;
}
