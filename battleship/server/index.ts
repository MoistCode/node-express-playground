import http from 'http';
import express from 'express';
import { Server as SocketIoServer } from 'socket.io';
import fs from 'fs';
import readLastLines from 'read-last-lines';

const port = 3000;
const app = express();

app.get('/chathistory', (req, res) => {
  readLastLines.read(`${__dirname}/chatlog.txt`, 50)
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
  fs.readFile(`${__dirname}/views/pages/index.html`, (err, data) => {
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
  fs.readFile(`${__dirname}/socket.io.js`, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

const server = http.createServer(app);
const io = new SocketIoServer(server)

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('red:chatmessage', (message: string) => {
    let msg = `Red: ${message}`;
    fs.appendFile(`${__dirname}/chatlog.txt`, `${msg}\n`, function (err) {
      if (!err) {
        io.emit('chatmessage', msg);
      }
    })
  });

  socket.on('blue:chatmessage', (message: string) => {
    let msg = `Blue: ${message}`;
    fs.appendFile(`${__dirname}/chatlog.txt`, `${msg}\n`, function (err) {
      if (!err) {
        io.emit('chatmessage', msg);
      }
    })
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Battleship listening on port ${port}`);
});