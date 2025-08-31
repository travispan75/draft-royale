'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import CardGrid from './_components/CardGrid';
import { io, Socket } from "socket.io-client";
import type { ServerToClient, ClientToServer, DraftSnapshot } from "@/ws/events";
import DeckGrid from './_components/DeckGrid';
import Timer from './_components/Timer';
import Badge from './_components/Badge';

function getOrCreatePlayerId() {
  let pid = localStorage.getItem('playerId');
  if (!pid) {
    pid = uuidv4();
    localStorage.setItem('playerId', pid);
  }
  return pid;
}

export default function Home() {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : (raw as string | undefined);
  }, [params]);

  const [joined, setJoined] = useState(false);
  const [snap, setSnap] = useState<DraftSnapshot | null>(null);
  const socketRef = useRef<Socket<ServerToClient, ClientToServer> | null>(null);
  const playerIdRef = useRef<string>("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const playerId = getOrCreatePlayerId();
        playerIdRef.current = playerId;
        const res = await fetch(`/api/room/${id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setJoined(true);
        } else {
          router.replace(`/waiting/${id}`);
        }
      } catch {
        router.replace(`/waiting/${id}`);
      }
    })();
  }, [id, router]);

  useEffect(() => {
    if (!joined || !id) return;
    const socket = io("/", { path: "/socket" });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { roomId: id, playerId: playerIdRef.current });
      socket.emit("game_ensure", { roomId: id });
      socket.emit("draft_request_state", { roomId: id });
    });

    socket.on("draft_state", (s) => {
      setSnap(s);
    });
    socket.on("ws_error", (e) => console.warn("ws_error", e));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [joined, id]);

  if (!joined) return null;

  const myRole =
    snap && (snap.players.p1 === playerIdRef.current ? "p1"
      : snap.players.p2 === playerIdRef.current ? "p2" : null);

  const canPick = !!(snap && myRole && snap.status === "draft" && snap.turn === myRole);
  const allCards = snap ? snap.pool : [];
  const used = snap ? [...snap.picks.p1, ...snap.picks.p2] : [];

  const onPickAction = (card: string) => {
    if (!socketRef.current || !snap || !myRole || !canPick) return;
    socketRef.current.emit("draft_pick", { roomId: id as string, playerId: playerIdRef.current, card });
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#000000" }}>
      <div style={{ flex: 1.5, padding: 32, display: "flex", flexDirection: "column", minHeight: 0, alignItems: "center", justifyContent: "center" }}>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", marginBottom: "10px" }}>
          {snap && <CardGrid allCards={allCards} used={used} canPick={canPick} onPickAction={onPickAction} />}
        </div>
        <div style={{ marginTop: 8, width: "86%" }}>
          {snap && (
            <Timer
              key={snap.picks.p1.length + snap.picks.p2.length}
              duration={snap.timer}
              active={canPick}
              running={snap.status === "draft"}
            />
          )}
        </div>
      </div>
      <div
        style={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 24,
        }}
      >
        <div
          style={{
            minHeight: 0,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          <Badge type="opponent" />
          <div style={{
            background: "#181818ff",
            borderRadius: 6,
            padding: "32px 24px",
            width: 600,
            height: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {snap && (
              <DeckGrid cards={myRole === "p1" ? snap.picks.p2 : snap.picks.p1} />
            )}
          </div>
        </div>

        <div
          style={{
            minHeight: 0,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
        >
          <Badge type="you" />
          <div style={{
            background: "#181818ff",
            borderRadius: 6,
            padding: "32px 24px",
            width: 600,
            height: 330,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {snap && (
              <DeckGrid cards={myRole === "p1" ? snap.picks.p1 : snap.picks.p2} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
