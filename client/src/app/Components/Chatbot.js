'use client'
import axios from "axios";
import { useState, useEffect, use, useRef } from "react";
import { toast } from "react-toastify";
import io from "socket.io-client";

const socket = io("http://localhost:8000");

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setloader] = useState(false)
    const chatEndRef =useRef(null); // Reference to last message


    useEffect(() => {
        socket.on("bot-message", (message, isloading) => {
            if (isloading) {
                setloader(true)
            }
            else {
                setloader(false)
                setMessages((prev) => [...prev, { sender: "bot", text: message }]);
                console.log(socket.id)
                
            }
        });
        socket.on('data',(data)=>{
          console.log(data)
          toast.success('Data Recorded')
          socket.disconnect()
        });


    }, []);

    useEffect(()=>{
      chatEndRef.current?.scrollIntoView({behaviour:'smooth'})
    },[messages])

    const sendMessage = () => {
        if (input.trim() === "") return;
        setMessages((prev) => [...prev, { sender: "user", text: input }]);
        socket.emit("user-message", input)
        setInput("");
    };

    return (
        <div className="h-screen flex flex-col justify-between  bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmjf-5-DthJ2fM9axZCbUYz2yxm5qPB81P0w&s')] bg-no-repeat bg-center text-white">
            <header className="w-full text-center bg-blue-500 p-4 mb-2 text-xl">
                Your Chatbot
            </header>
            <div className="overflow-auto flex-1">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "bot" ? " text-left" : "text-right text-black"}>
                        <p className="inline-block  md:px-3 px-1 py-2 rounded-lg m-1"
                            style={{ background: msg.sender === "bot" ? "rgb(40,80,100)" : "rgb(255,200,100)" }}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {loading && <p className="text-gray-400 text-[15px] m-4">Generating....</p>}
                <div ref={chatEndRef}></div> {/* Invisible div to scroll to */}

            </div>
            <div className="flex p-3">
                <input 
                    autoFocus
                    className="flex-1 p-2 text-black rounded border border-black"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type here..."
                />
                <button onClick={sendMessage} className="ml-2 p-2 bg-green-500 rounded">Send</button>
            </div>
        </div>
    );
}
