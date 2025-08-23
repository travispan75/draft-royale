'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

function getOrCreatePlayerId() {
    let pid = localStorage.getItem('playerId');
    if (!pid) {
        pid = uuidv4();
        localStorage.setItem('playerId', pid);
    }
    return pid;
}

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (mounted && id) setShareUrl(`${window.location.origin}/waiting/${id}`); }, [mounted, id]);

    useEffect(() => {
        if (!mounted || !id) return;
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
                    setErr(data.error || 'join_failed');
                }
            } catch { setErr('network_error'); }
        })();
    }, [mounted, id]);

    useEffect(() => {
        if (!mounted || !id || !joined) return;
        let t: number;
        const poll = async () => {
            try {
                const res = await fetch(`/api/room/${id}/state`, { cache: 'no-store' });
                const data = await res.json();
                if (data?.status === 'ready') { router.replace(`/play/${id}`); return; }
            } catch { }
            t = window.setTimeout(poll, 800);
        };
        poll();
        return () => clearTimeout(t);
    }, [mounted, id, joined, router]);

    if (!mounted) return null;

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <div style={{ textAlign: 'center', maxWidth: 640, width: '100%' }}>
                <h1>Waiting for your opponent…</h1>
                <p>Send this link to your friend:</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <code style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, userSelect: 'all', maxWidth: '100%', overflowX: 'auto' }}>
                        {shareUrl || '…'}
                    </code>
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} disabled={!shareUrl}>Copy</button>
                </div>
                {err && <p style={{ color: 'crimson', marginTop: 12 }}>Error: {err}</p>}
            </div>
        </div>
    );
}
