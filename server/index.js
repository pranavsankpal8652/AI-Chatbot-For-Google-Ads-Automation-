const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { socketdata, userSessions, currentQuestionIndex } = require("./app/Configs/SocketConfig");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();
const app = express();
app.use(cors())
app.use(express.json())



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);


socketdata(io,genAI)


server.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
