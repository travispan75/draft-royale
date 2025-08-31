"use client";

import { BsIncognito } from "react-icons/bs";

type BadgeProps = {
    type: "opponent" | "you";
};

export default function Badge({ type }: BadgeProps) {
    const isOpponent = type === "opponent";

    return (
        <div
            style={{
                position: "relative",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isOpponent ? "#ff5555" : "#3a82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                fontSize: isOpponent ? 18 : 11,
                flex: "0 0 36px",
            }}
        >
            {isOpponent ? (
                <BsIncognito />
            ) : (
                <span style={{ transform: "translateY(1px)" }}>YOU</span>
            )}
            <div
                style={{
                    position: "absolute",
                    right: -12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: `8px solid ${isOpponent ? "#ff5555" : "#3a82f6"}`,
                }}
            />
        </div>
    );
}
