import { useEffect, useState } from "react";
// import logo from './logo.svg'
// import './App.css'
import io from "socket.io-client";
// import Picker from "emoji-picker-react";
// import Picker from 'emoji-picker-react';
const socket = io("http://localhost:5000");

import { useRef } from "react";
function App() {
  const [socketId, setSocketId] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [room, setRoom] = useState("");
  const [chat, setChat] = useState([]);
  // const chatContainer = useRef(null);
  useEffect(
    () => {
      socket.on("me", id => {
        setSocketId(id);
      });

      socket.on("disconnect", () => {
        socket.disconnect();
      });

      socket.on("getAllUsers", users => {
        setUsers(users);
      });

      // Real time
      socket.on("updateUsers", users => {
        setUsers(users);
      });

      socket.on("getAllRooms", rooms => {
        setRooms(rooms);
      });

      // Real time
      socket.on("updateRooms", rooms => {
        setRooms(rooms);
      });

      // Rooms
      socket.on("chat", payload => {
        setChat(payload.chat);
      });
      // if (joinedRoom === true) {
      //   chatContainer.current.scrollIntoView({
      //     behavior: "smooth",
      //     block: "end"
      //   });
      // }
    },
    [chat, users]
  );

  const sendMessage =async () => {
    const payload = { message, room, socketId };
    socket.emit("message", payload);
    setMessage("");
    socket.on("chat", payloadd => {
      setChat(payloadd.chat);
      console.log(payloadd);
    });
    // chatContainer.current.scrollIntoView({
    //   behavior: "smooth",
    //   block: "end"
    // });
  };

  const createRoom = () => {
    socket.emit("create_room");
    socket.on("get_room", room => {
      setRooms([...rooms, room]);
    });
  };

  const joinRoom = room => {
    socket.emit("join_room", room);
    setRoom(room.id);
    setJoinedRoom(true);
    setChat(room.chat);
  };

  return (
    <div className="w-full h-full font-sans">
      <div className="w-full h-10 border-green  border-b">
        <h1 className=" w-full max-w-full h-full grid place-items-center uppercase font-thin text-xl border-r border-green ">
          Chat Room
        </h1>
      </div>
      <div className="w-full h-10 border-green  border-b flex">
        <h1 className="md:w-1/2 sm:w-full h-full  font-thin text-xl flex justify-start pl-10 items-center border-r border-green">
          ME: {socketId ? socketId : "no id"}
        </h1>
        <h1 className="md:w-1/2 sm:w-full h-full  font-thin text-xl flex justify-start pl-10 items-center ">
          {joinedRoom ? `room ${room}` : "no room joined"}
        </h1>
      </div>
      <div className="w-full h-[87vh]  flex ">
            <div className="w-1/4 border-r border-green flex flex-col">
              <div className="w-full  border-b border-green grid place-content-center">
                {" "}USERS
              </div>
              <div className="w-full h-full justify-center flex overflow-y-auto">
                <ul className="text-center mt-2">
                  {users.map(user => {
                    return (
                      <li key={user} className="mb-1">
                        {user == socketId ? "me" : user}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="w-1/4 border-r border-green flex flex-col items-center">
              <div className="w-full  border-b border-green grid place-content-center">
                {" "}ROOMS
              </div>
              <div className="w-full h-full flex flex-col justify-between items-center">
                <div className="w-full justify-center flex ">
                  {rooms.length === 0
                    ? <p className="mt-2">No Rooms Available!</p>
                    : <ul className="text-center mt-2">
                        {rooms.map(room => {
                          return (
                            <li
                              key={room.id}
                              className="mb-1"
                              onClick={() => joinRoom(room)}
                            >
                              {room.id}
                            </li>
                          );
                        })}
                      </ul>}
                </div>
                <div className="w-full h-20 grid place-content-center mb-4 ">
                  <button
                    onClick={() => createRoom()}
                    className="w-32 border border-green hover:bg-green-100 hover:-translate-y-1 transition-all"
                  >
                    create room
                  </button>
                </div>
              </div>
            </div>
            <div className="w-1/2 ">
              <div className="w-full  border-b border-green grid place-content-center">
                {" "}CHATS
              </div>
              {joinedRoom &&
                <div className="w-full h-full">
                  <div>
                    <ul className="" id="chat-list" >
                      {chat.map((chat, idx) => {
                        return (
                          <li key={idx}>
                            {chat.writer === socketId
                              ? `${chat.message}:me`
                              : `User(${chat.writer.slice(0, 5)}) : ${chat.message}`}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <form onSubmit={(e)=>e.preventDefault()}>
                    <input type="text" placeholder="your message..." autoFocus onChange={e=>setMessage(e.target.value)} value={message}/>
                    <button onClick={()=>sendMessage()}>send</button>
                  </form>
                  
                </div>}
            </div>
          </div>
    </div>
  );
}

export default App;
