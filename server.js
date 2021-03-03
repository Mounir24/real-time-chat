const app = require("express")();
const express = require('express');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const crypto = require("crypto");
const fs = require('fs');
const cors = require('cors');
require('dotenv/config')
const notifier = require('node-notifier'); // Notification alerts
const formater = require('./public/formatData');

// Middleware
app.use(cors());

// Initialize options
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Encrypt function
function encrypt(txt) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(txt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
}


// Decrypt function
/*function decrypt(text) {
    let iv = Buffer.from(text.iv, "hex");
    let encryptedText = Buffer.from(text.encryptedData, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}



const hsh = encrypt("I am Web developer, from U.S.A / selecon valley");
console.log(hsh);
console.log(decrypt(hsh));*/
// PORT
const PORT = process.env.PORT || 9090;

// Middlewares
app.use(express.static('public'));

// Routes
app.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/index.html");
});
const users = [];
io.on("connection", (socket) => {

    // Welcome message for all users
    socket.emit('message', formater('Mbn Boot', 'Welcome to chat room'));

    // Broadcast the event
    socket.broadcast.emit('message', formater('MBN Boot', 'new user has been joined'));
    //console.log('user connected: ' + socket.id);
    if (!socket) return null;
    // Check if the user already exist or not
    if (!users.includes(socket.id)) {
        users.push(socket.id);
        console.log('New User Joined: ' + socket.id);
    }
    socket.on("chat", (payload) => {
        //console.log("New Message: " + payload);
        // Encypt incoming data
        /*if (!payload.user) return null;
        // Check if the user already exist or not
        if (!users.includes(payload.user)) {
            users.push(payload.user);
            console.log('New User Joined: ' + payload.user);
            console.log(users);
        }*/

        //socket.broadcast.emit('chat', formater(`MBN Boot: new user has benn joined`));
        // Encrypted data 
        const encryptedMsgs = encrypt(payload.message)
        fs.appendFile("./file_logs.txt", `-- ${encryptedMsgs} --`, (err) => {
            if (err) throw err;
            console.log(users);
            console.log("New Data Transmitted successfuly 100%");
        });

        // Sent the message back to the Page
        io.sockets.emit("chat", payload);
        notifier.notify({
            title: payload.user + ' sent a message',
            subtitle: payload.user + ' has been sent a message',
            message: payload.message,
            icon: null,
            //contentImage: "./public/error.png",
            sound: true,
            wait: true,
        });
    });

    // When user disconnect
    socket.on('disconnect', () => {
        users.slice(users.indexOf(socket.id), 1);
        console.log('user disconnected ' + socket.id);
        console.log(users);

    })

    socket.on('typing', (payload) => {
        socket.broadcast.emit('typing', payload)
    })
});

// Server listen
server.listen(PORT, () => {
    console.log("Server runing on port: http://localhost:" + PORT);
});