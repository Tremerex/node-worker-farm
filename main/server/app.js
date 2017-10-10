import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import socketIO from 'socket.io';
import cors from 'cors';
import { Worker } from 'webworker-threads';

import workerFarm from 'worker-farm';

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

const io = socketIO.listen(app.listen(PORT, () => console.log('listen on port', PORT)));

const connectedSockets = [];

let currentState = 'Up';

io.sockets.on('connection', socket => {
    const { userName } = socket.handshake.query;
    connectedSockets.push({ id: userName, socket: socket });
    io.emit('init', { message: `${userName} gets in to the room` });
    socket.on('trace', data => {
        if (data.trace) {
            const workers = workerFarm(require.resolve('./workers/worker'));
            workers({ currentState }, (err, data) => {
                currentState = data;
                socket.emit('traceStatus', { status: data });
                workerFarm.end(workers);
            });
        } else {
            socket.emit('traceStatus', { status: 'Service disconnected' });
            workerFarm.end(workers);
        }
    });
});

app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
