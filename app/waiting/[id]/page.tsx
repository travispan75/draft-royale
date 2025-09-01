'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { io, Socket } from 'socket.io-client';
import type { ServerToClient, ClientToServer } from '@/ws/events';

function getOrCreatePlayerId() {
    let pid = localStorage.getItem('playerId');
    if (!pid) {
        pid = uuidv4();
        localStorage.setItem('playerId', pid);
    }
    return pid;
}

export default function Page() {
    const { id: roomId } = useParams<{ id: string }>();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [roomStatus, setRoomStatus] = useState<'waiting' | 'ready'>('waiting');

    const socketRef = useRef<Socket<ServerToClient, ClientToServer> | null>(null);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (mounted && roomId) setShareUrl(`${window.location.origin}/waiting/${roomId}`); }, [mounted, roomId]);

    useEffect(() => {
        if (!mounted || !roomId) return;
        const playerId = getOrCreatePlayerId();
        const socket = io('/', { path: '/socket', transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('connect', () => {
            socket.emit('join_room', { roomId, playerId });
        });
        socket.on('room_state', (room) => {
            setErr(null);
            setRoomStatus(room.status);
            if (room.status === 'ready') {
                router.replace(`/play/${roomId}`);
            }
        });
        socket.on('ws_error', (e) => {
            setErr(`${e.code}: ${e.msg}`);
        });
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [mounted, roomId, router]);

    if (!mounted) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', padding: 24, background: '#000000', color: '#ffffff', fontFamily: 'Montserrat' }}>
            <div style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
                <h1>{roomStatus === 'waiting' ? 'Waiting for your opponent…' : 'Ready!'}</h1>
                <p>Send this link to your friend:</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <code style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, userSelect: 'all', maxWidth: '100%', overflowX: 'auto', background: '#111', color: '#fff' }}>
                        {shareUrl || '…'}
                    </code>
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} disabled={!shareUrl} style={{ background: '#222', color: '#fff', border: '1px solid #555', borderRadius: 6, padding: '6px 12px', cursor: shareUrl ? 'pointer' : 'not-allowed' }}>Copy</button>
                </div>
                {err && <p style={{ color: 'crimson', marginTop: 12 }}>Error: {err}</p>}
            </div>
        </div>
    );
}
