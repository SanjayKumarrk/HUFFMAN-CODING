const { Server } = require("socket.io");
const { createServer } = require("http");

const httpServer = createServer();
httpServer.listen(3000, "192.168.0.115");
const io = new Server(httpServer, {
  cors: { origin: ["http://192.168.0.115:5173"] },
});

io.on("connection", (socket) => {
  console.log("Connected to server", socket.id);
  socket.on("tx", (data) => {
    socket.broadcast.emit("rx", data);
  });
});
