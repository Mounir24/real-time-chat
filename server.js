const app = require("express")();
const express = require('express');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const crypto = require("crypto");
const fs = require('fs');
const cors = require('cors');
require('dotenv/config')
const notifier = require('node-notifier'); // Notification alerts

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
}*/

//const hsh = encrypt("I am Web developer, from U.S.A / selecon valley");
//console.log(hsh);
//console.log(decrypt(hsh));
// PORT
const PORT = process.env.PORT || 9090;

// Middlewares
app.use(express.static('public'));

// Routes
app.get("/", (req, res) => {
    res.status(200);
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    socket.on("chat", (payload) => {
        //console.log("New Message: " + payload);
        // Encypt incoming data
        fs.appendFile("./file_logs.txt", encrypt(payload.message), (err) => {
            if (err) throw err;
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

    socket.on('typing', (payload) => {
        socket.broadcast.emit('typing', payload)
    })
});

// Server listen
server.listen(PORT, () => {
    console.log("Server runing on port: " + PORT);
});