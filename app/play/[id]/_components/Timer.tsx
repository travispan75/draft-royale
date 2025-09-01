"use client";
import { useEffect, useState } from "react";
import { FaHourglass } from "react-icons/fa6";

type TimerProps = {
    duration: number;
    initial: number;
    active: boolean;
    running: boolean;
};

export default function Timer({ duration, initial, active, running }: TimerProps) {
    const [time, setTime] = useState(initial);

    useEffect(() => {
        if (!running) return;
        setTime(initial);
        const id = setInterval(() => {
            setTime(t => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, [initial, running]);

    if (!running) {
        return (
            <div style={{ width: "100%", position: "relative" }}>
                <div
                    style={{
                        width: "100%",
                        height: 20,
                        borderRadius: 8,
                        background: "rgba(78, 78, 78, 1)",
                        overflow: "hidden",
                        position: "relative",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: 14,
                    }}
                >
                    <FaHourglass style={{ fontSize: 10 }} />
                </div>
            </div>
        );
    }

    const pct = Math.max(0, Math.min(100, (time / duration) * 100));
    const danger = active && time <= 5;
    const barColor = active ? (danger ? "#e11d48" : "#22c55e") : "#797979ff";
    const textColor = active ? "#ffffff" : "#e5e7eb";

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <div
                style={{
                    width: "100%",
                    height: 20,
                    borderRadius: 8,
                    background: "rgba(78, 78, 78, 1)",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        width: `${pct}%`,
                        height: "100%",
                        transition: "width 1s linear",
                        background: barColor,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: textColor,
                        fontFamily: "Montserrat",
                    }}
                >
                    {time} SEC
                </div>
            </div>
        </div>
    );
}
