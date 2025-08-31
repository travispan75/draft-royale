import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import {
    handleJoinRoom,
    handleGetRoom,
    handleGameEnsure,
    handleDraftRequestState,
    handleDraftPick,
} from "./handlers";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function main() {
    await app.prepare();

    const httpServer = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(httpServer, {
        path: "/socket",
        cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
        console.log("WS connected:", socket.id);

        socket.on("join_room", (payload) => handleJoinRoom(io, socket, payload));
        socket.on("get_room", (payload) => handleGetRoom(io, socket, payload));
        socket.on("game_ensure", (payload) => handleGameEnsure(io, socket, payload));
        socket.on("draft_request_state", (payload) => handleDraftRequestState(io, socket, payload));
        socket.on("draft_pick", (payload) => handleDraftPick(io, socket, payload));

        socket.on("ping", (payload) => {
            console.log("got ping:", payload);
            socket.emit("pong", { ok: true, echo: payload });
        });

        socket.on("disconnect", (reason) => {
            console.log("WS disconnected:", socket.id, reason);
        });
    });

    const port = Number(process.env.PORT || 3000);
    httpServer.listen(port, () => {
        console.log(`> Next + WS ready on http://localhost:${port}`);
    });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
