'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();

  function getOrCreatePlayerId() {
    let pid = localStorage.getItem('playerId');
    if (!pid) {
      pid = uuidv4();
      localStorage.setItem('playerId', pid);
    }
    return pid;
  }

  async function handleNewGame() {
    const roomId = uuidv4();
    getOrCreatePlayerId();
    router.push(`/waiting/${roomId}`);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', justifyContent: 'center', alignItems: 'center', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px', fontWeight: '700' }}>Draft Royale</h1>
        <button onClick={handleNewGame} style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '6px', border: '1px solid #fff', background: '#222', color: '#fff', cursor: 'pointer' }}>
          New Game
        </button>
      </div>
    </div>
  );
}
