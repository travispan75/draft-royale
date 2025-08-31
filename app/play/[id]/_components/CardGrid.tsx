'use client';

import { CARDS, NO_PADDING_CARDS } from '@/data/card';

type Props = {
    allCards: string[];
    used: string[];
    canPick: boolean;
    onPickAction: (card: string) => void;
};

export default function CardGrid({ allCards, used, canPick, onPickAction }: Props) {
    const imageByName: Record<string, string> = {};
    for (const c of CARDS) imageByName[c.name] = c.image;
    const usedSet = new Set(used);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 90px)',
                gap: 4,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {allCards.map((name) => {
                const src = imageByName[name];
                const isUsed = usedSet.has(name);

                const clickable = canPick && !isUsed;
                const filter = !canPick ? "grayscale(100%)" : isUsed ? "grayscale(100%)" : "none";
                const cursor = clickable ? 'pointer' : 'default';

                if (NO_PADDING_CARDS.has(name)) {
                    return (
                        <div
                            key={name}
                            onClick={() => clickable && onPickAction(name)}
                            style={{
                                borderRadius: 8,
                                aspectRatio: '1 / 1',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                filter,
                                cursor,
                            }}
                        >
                            <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={name}
                            onClick={() => clickable && onPickAction(name)}
                            style={{
                                borderRadius: 8,
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'visible',
                                filter,
                                cursor,
                            }}
                        >
                            <img
                                src={src}
                                alt={name}
                                style={{
                                    width: '85%',
                                    height: 'auto',
                                    position: 'absolute',
                                    transform: 'translateY(-6px)',
                                }}
                            />
                        </div>
                    );
                }
            })}
        </div>
    );
}
