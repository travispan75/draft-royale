'use client';

import { CARDS, NO_PADDING_CARDS } from '@/data/card';

type Props = {
    pool: string[];
};

export default function CardGrid({ pool }: Props) {
    const imageByName: Record<string, string> = {};
    for (const c of CARDS) imageByName[c.name] = c.image;

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
            {pool.map((name) => {
                const src = imageByName[name];

                if (NO_PADDING_CARDS.has(name)) {
                    return (
                        <div
                            key={name}
                            style={{
                                borderRadius: 8,
                                aspectRatio: '1 / 1',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src={src}
                                alt={name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={name}
                            style={{
                                borderRadius: 8,
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'visible',
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
