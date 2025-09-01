'use client';

import { CARDS, NO_PADDING_CARDS } from '@/data/card';
import { FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fadeUp } from '@/app/animations/fadeUp';

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
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridAutoRows: '1fr',
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
                <motion.img
                  src={src}
                  alt={name}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <motion.img
                  src={src}
                  alt={name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                    transformOrigin: "center top",
                  }}
                  initial={{
                    opacity: 0,
                    y: 30,
                    scale: 1.25,
                    translateY: "-15%",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1.25,
                    translateY: "-15%",
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1],
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
