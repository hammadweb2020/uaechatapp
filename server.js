const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./public/utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUser } = require('./public/utils/users');

const app = express();
const server = http.createServer(app);
const io =  socketio(server);

const botUser = 'Server';

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client Connect
io.on('connection', socket => {


socket.on('joinRoom', ({ username, room }) => {

  
const user = userJoin(socket.id, username, room);

socket.join(user.room);

        //welcome new user 
socket.emit('message', formatMessage(botUser,`Welcome to ${user.room} Chat Room`));

// Broadcast when a user connect
socket.broadcast.to(user.room).emit('message', formatMessage(botUser,`${user.username} has joined the chat`));


//send users and room info

io.to(user.room).emit('roomUsers', {
room : user.room,
users: getRoomUser(user.room)
});


});




  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });



//Runs when client disconnected 
socket.on('disconnect', () => {

    const user = userLeave(socket.id);
if(user)
{
    io.to(user.room).emit('message', formatMessage(botUser,`${user.username} has left the chat`));

    io.to(user.room).emit('roomUsers', {
        room : user.room,
        users: getRoomUser(user.room)
        });
}

  
})



}) 


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server is running on ${PORT}`));

