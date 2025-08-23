'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import CardGrid from './_components/CardGrid';

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
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const playerId = getOrCreatePlayerId();
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
    (async () => {
      const res = await fetch(`/api/game/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok) setGame(data.game);
    })();
  }, [joined, id]);

  useEffect(() => {
    if (!joined || !id) return;
    let t: number;

    const poll = async () => {
      try {
        const res = await fetch(`/api/game/${id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.ok) setGame(data.game);
      } catch {
      }
      t = window.setTimeout(poll, 1000);
    };

    poll();
    return () => clearTimeout(t);
  }, [joined, id]);

  if (!joined) return null;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 2, background: 'lightgray', padding: 12 }}>
        {game && <CardGrid pool={game.pool} />}
      </div>
      <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "pink" }}>Opponent Deck</div>
        <div style={{ flex: 1, background: "lightblue" }}>Your Deck</div>
      </div>
    </div>
  );
}
