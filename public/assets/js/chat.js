const socket = io();


// Elements
const $chatForm = document.querySelector('#chat-form');
const $chatFormMessageInput = $chatForm.querySelector('input[name=message]');
const $chatFormSubmitButton = $chatForm.querySelector('button[type=submit]');
const $locationButton = document.querySelector('#share-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');
const $locationMessages = document.querySelector('#location-messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMeesageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;
    if (containerHeight - newMeesageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;

    }
}
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { message: message.text, username: message.username, createdAt: moment(message.createdAt).format('H:mm') });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (data) => {
    const html = Mustache.render(locationMessageTemplate, { message: data.url, username: message.username, createdAt: moment(data.createdAt).format('H:mm') });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, { room, users });
    $sidebar.innerHTML = html;
})

$chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $chatFormSubmitButton.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', e.target.elements.message.value, (error) => {
        $chatFormSubmitButton.removeAttribute('disabled');
        $chatFormMessageInput.value = '';
        $chatFormMessageInput.focus();
        
        if (error) {
            return console.log(error);
        }
    });
});

document.querySelector('#share-location').addEventListener('click', () => {
    if (!"geolocation" in navigator) {
        return  alert('Geolocation is not supported by your browser.')
    }
    
    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { lat: position.coords.latitude, lng: position.coords.longitude }, 
        () => {
            $locationButton.removeAttribute('disabled');
        });
    });
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});