import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import app from "./app";

const socketConnection = (server: Server): void => {
  const io: SocketServer = new SocketServer(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 100 * 1024 * 1024, // 100MB in bytes
  });
  app.set("io", io);

  io.on("connection", async (socket: Socket) => {
    socket.join(socket?.handshake?.query?.userId?.toString() || "");
    if (socket?.handshake?.query?.branchId) {
      socket.join(
        "branch" + socket?.handshake?.query?.branchId?.toString() || ""
      );
    }
    console.log("Socket Connected");

    socket.on("test", (data: Object, callBack: Function) => {
      callBack(data);
      console.log("Socket tested");
    });

    socket.on("disconnect", () => {
      socket.leave(socket?.handshake?.query?.userId?.toString() || "");
      if (socket?.handshake?.query?.branchId) {
        socket.leave(
          "branch" + socket?.handshake?.query?.branchId?.toString() || ""
        );
      }
      console.log("Socket disconnected");
    });
  });
};

export default socketConnection;
