const app = require("express")();
const server = require("http").createServer(app);

const PORT = 5000;

const {nanoid}=require("nanoid");
// const { v4 } = require('uuid')

const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});
let userids = [];
let roomids = [];

io.on("connection", socket => {
  console.log(`User connected: ${socket.id}`);
  
  socket.emit("me", socket.id);
  userids.push(socket.id);
  console.log("ALL USERS",userids);

  socket.broadcast.emit("updateUsers", userids);

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected.`);
    userids = userids.filter(userid => userid !== socket.id);
    console.log("ALL USERS",userids);
    socket.broadcast.emit("updateUsers", userids);
    socket.disconnect();
  });
  socket.emit("getAllUsers", userids);

  // rooms
  socket.on("create_room", () => {
    const room = {
      id: nanoid(),
      chat: []
    };
    socket.join(room);
    socket.emit("get_room", room);
    roomids.push(room);
    socket.broadcast.emit("updateRooms", roomids);
    console.log('rooms',roomids)
  });

  socket.on("join_room", room => {
    socket.join(room.id);
    console.log(`user ${socket.id} joined room: ${room.id}`);
  });

  socket.emit('getAllRooms',roomids)
  socket.broadcast.emit("updateRooms", roomids);
  socket.on("message", payload => {
    roomids.map(room =>{
        if(room.id===payload.room){
          const singleChat={message: payload.message,writer:payload.socketId};
          room.chat.push(singleChat);
          payload.chat=room.chat;
        }
    })
    io.to(payload.room).emit('chat',payload)
  });

});
server.listen(PORT,()=>{
  console.log(`listening on port ${PORT}`)
})