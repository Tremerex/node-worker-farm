import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import socketIO from 'socket.io';
import request from 'request';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

const io = socketIO.listen(app.listen(PORT, () => console.log('listen on port', PORT)));

let currentState = 'Up';

io.sockets.on('connection', socket => {
    socket.on('changeStatus', data => {
        if (data) {
            currentState = data.status;
        }
    });
});

app.get('/api/getState', (req, res) => {
    res.status(200).json({ status: currentState });
});

app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
