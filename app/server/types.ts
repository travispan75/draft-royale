export type RoomStatus = "waiting" | "ready";

export interface Room {
  id: string;
  createdAt: number;
  players: string[]; // we’ll just store session ids or anonymous ids
  status: RoomStatus;
}
