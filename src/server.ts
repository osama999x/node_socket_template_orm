import http from "http";
import app from "./app";
import socketConnection from "./socket";

const PORT = process.env.PORT;
const server = http.createServer(app);
socketConnection(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
