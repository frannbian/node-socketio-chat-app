const users = [];

const addUser = ({ id, username, room}) => {
    // Clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate data
    if (!username || !room) {
        return {
            error: 'Username and room are required',
        }
    }

    // Check for existing User
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use.',
        }
    }

    // Store user
    const user = { id, username, room };
    users.push(user);

    return { user };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)

    if (!user) {
        return {
            error: 'User not found.'
        }
    }

    return user;
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};