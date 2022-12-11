"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const read_last_lines_1 = __importDefault(require("read-last-lines"));
const port = 3000;
const app = (0, express_1.default)();
app.get('/chathistory', (req, res) => {
    read_last_lines_1.default.read(`${__dirname}/chatlog.txt`, 50)
        .then((lines) => {
        res.writeHead(200);
        res.end(JSON.stringify(lines.split('\n').filter((el) => Boolean(el))));
    })
        .catch((err) => {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
    });
});
app.get('/', (req, res) => {
    fs_1.default.readFile(`${__dirname}/views/pages/index.html`, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});
app.get('/socketfile', (req, res) => {
    fs_1.default.readFile(`${__dirname}/socket.io.js`, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('red:chatmessage', (message) => {
        let msg = `Red: ${message}`;
        fs_1.default.appendFile(`${__dirname}/chatlog.txt`, `${msg}\n`, function (err) {
            if (!err) {
                io.emit('chatmessage', msg);
            }
        });
    });
    socket.on('blue:chatmessage', (message) => {
        let msg = `Blue: ${message}`;
        fs_1.default.appendFile(`${__dirname}/chatlog.txt`, `${msg}\n`, function (err) {
            if (!err) {
                io.emit('chatmessage', msg);
            }
        });
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
server.listen(port, () => {
    console.log(`Battleship listening on port ${port}`);
});
