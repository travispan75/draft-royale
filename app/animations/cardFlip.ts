import type { Variants } from "framer-motion";

export const cardFlip: Variants = {
    hidden: { rotateY: 180, opacity: 0 },
    visible: (custom?: { delay?: number }) => ({
        rotateY: 0,
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: [0.4, 0.2, 0.2, 1] as const,
            delay: custom?.delay ?? 0
        }
    })
};
