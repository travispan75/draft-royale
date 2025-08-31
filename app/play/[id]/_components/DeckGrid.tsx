'use client';

import { CARDS, NO_PADDING_CARDS } from '@/data/card';
import { FaPlus } from 'react-icons/fa';

type Props = { cards: string[] };

export default function DeckGrid({ cards }: Props) {
  const imageByName: Record<string, string> = {};
  for (const c of CARDS) imageByName[c.name] = c.image;

  const slots = [...cards];
  while (slots.length < 8) slots.push('');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 120px)',
        gridAutoRows: '120px',
        gap: 12,
        justifyContent: 'center',
        alignContent: 'center',
        padding: 8,
      }}
    >
      {slots.map((name, i) => {
        const hasCard = !!name;
        const src = hasCard ? imageByName[name] : undefined;
        const isNoPad = hasCard && NO_PADDING_CARDS.has(name);

        const cellFlex: React.CSSProperties = {
          aspectRatio: '1 / 1',
          width: '110px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: hasCard ? 'transparent' : 'rgba(0,0,0,0.05)',
          border: hasCard ? 'none' : '2px dashed rgba(255,255,255,1)',
        };

        const cellGrid: React.CSSProperties = {
          aspectRatio: '1 / 1',
          width: '110px',
          borderRadius: 8,
          display: 'grid',
          alignItems: 'center',
          justifyItems: 'center',
          background: 'rgba(0,0,0,0.05)',
          border: '2px dashed rgba(255,255,255,1)',
        };

        const cellStyle = hasCard ? cellFlex : cellGrid;

        return (
          <div key={i} style={cellStyle}>
            {hasCard ? (
              isNoPad ? (
                <img
                  src={src}
                  alt={name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={src}
                  alt={name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    transform: 'scale(1.25) translateY(-15%)',
                    transformOrigin: 'center top',
                  }}
                />
              )
            ) : (
              <FaPlus color="white" />
            )}
          </div>
        );
      })}
    </div>
  );
}
