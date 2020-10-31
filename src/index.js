require('dotenv').config();
const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const socket = require('socket.io');
const http = require('http');
const {ev} = require('@open-wa/wa-automate');

const {PORT} = process.env;
const SOCKET_STORE = [];

const router = require("./route");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(cors());
app.use(express.urlencoded({limit: '128mb', extended: true}));
app.use(express.json({limit: '128mb'}));
app.use(logger('combined'));
app.use(express.static(__dirname + '/public'));
app.use(router);

server.listen(PORT || 8080, () => console.log('Server listen to port ' + (PORT || 8080)));

io.on('connection', socket => {
    console.log('new socket client connected!');
    SOCKET_STORE.push(socket);
});

ev.on('qr.**', async (data, sessionId, namespace) => {
    for (const socketStoreElement of SOCKET_STORE) {
        await socketStoreElement.send({data, sessionId, namespace});
    }
});

ev.on('**', async (data, sessionId, namespace) => {
    if (namespace.includes('sessionData')) console.log('SessionData = [', data, ']');
    if(data && data.includes && data.includes("ready for account")) {
        for (const socketStoreElement of SOCKET_STORE) {
            await socketStoreElement.send({data: '/images/success.png', sessionId, namespace: 'ready'});
        }
    }
    if(data && data.includes && data.includes("Timeout")) {
        for (const socketStoreElement of SOCKET_STORE) {
            await socketStoreElement.send({data: '/images/timeout.jpg', sessionId, namespace: 'timeout'});
        }
    }
});

module.exports = app;