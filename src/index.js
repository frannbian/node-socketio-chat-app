const express = require('express');
const path = require('path');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const port = process.env.PORT;

const http = require('http').Server(app)
const io = require('socket.io')(http);

// Setup static directory to serve 
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error); 
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined.`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        
        const filter = new Filter();

        if(filter.isProfane(message)) {
            return callback('Profanity is no allowed!')
        }

        io.to(user.room).emit('message', generateMessage(message, user.username));
        callback();
    });

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.lat},${location.lng}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
});

http.listen(port, () => {
    console.log(`App running on port ${port}`)
})