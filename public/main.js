$(document).ready(function() {

    //Initialize Socket.io
    const socket = io();

    // Welcome messages to the user
    socket.on('message', payload => {
            $('#messages').append($('<p>').text(payload.username + ': ' + payload.msg + ' (' + payload.date + ')'))
        })
        // On form submit , Send message to server
    $('form').submit(() => {
        socket.emit('chat', {
            user: $('#user').val(),
            message: $('#msg').val()
        });
        $('#msg').val('');
        $('#user').val('');
        //alert('message has been sent successfuly')
        return false;
    });

    // Broadcats message
    $('#msg').on('keydown', () => {
        socket.emit('typing', $('#user').val());
    })

     // Broadcast message to the sockets
     socket.on('typing', (payload) => {
        $('#feedback').text(payload + ' typing...');
    })

    // When a message sent to server , append it to DOM
    socket.on('chat', (payload) => {
        $('#feedback').text('');
        //$('#messages').html(`<strong>${payload.username}</strong>: ${payload.msg} (${payload.date})`);
        $('#messages').append($('<p>').text(payload.user + ': ' + payload.message + ' (' + new Date().toLocaleDateString() + ')'));
    })

    // When a user connected to server , he w'll displayed in DOM
    socket.emit('disconnect', () => {
            alert('You disconnect');
        })
});