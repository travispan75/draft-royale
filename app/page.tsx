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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div>
        <h1>hi</h1>
        <button onClick={handleNewGame}>New Game</button>
      </div>
    </div>
  );
}
