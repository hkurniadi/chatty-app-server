// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  //Broadcast the number of users connected
  wss.clients.forEach((client) => {
    let numOfUsers = {
      type: "activeUsers",
      counts: wss.clients.size
    }
    client.send(JSON.stringify(numOfUsers));
  });

  //Broadcast message to all
  ws.on('message', (msg) => {
    console.log("Incoming message: ", msg);
    let message = JSON.parse(msg);
    console.log('message is', message);
    if (message.type === 'postMessage') {
      message.key = uuid.v4();
      message.type = 'incomingMessage';
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    } else if (message.type === 'postNotification') {
      message.key = uuid.v4();
      message.type = 'incomingNotification';
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
    }
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    wss.clients.forEach((client) => {
      let numOfUsers = {
        type: "activeUsers",
        counts: wss.clients.size
      }
      client.send(JSON.stringify(numOfUsers));
    });
    console.log('Client disconnected');
  });
});
