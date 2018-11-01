window.addEventListener('load', () => {
  //Chat platform
  const chatTemplate = Handlebars.compile($('#chat-template').html());
  const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
  const chatEl = $('#chat');
  const formEl = $('.form');
  const messages = [];
  let username;

  //Local Video
  const localImageEl = $('#local-image');
  const localVideoEl = $('#local-video');

  //Remote Video
  const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
  const remoteVideoEl = $('#remote-videos')
  let remoteVideosCount = 0;

  //Add validation rules to Create/Join Room Form
  formEl.form({
    fields: {
      roomName: 'empty',
      username: 'empty',
    },
  });

  //create our WebRTC connection
  const webrtc = new SimpleWebRTC({
    //the id/element dom element that will hold local video
    localVideoEl: 'local-video',
    //the id/element dom element that will hold remote videos
    remoteVideosEl: 'remote-videos',
    //immediately ask for camera access
    autoRequestMedia: true,
  });

  //we have access to local camera
  webrtc.on('localStream', () => {
    localImageEl.hide();
    localVideoEl.show();
  });

  const updateChatMessages = () => {
    const html = chatContentTemplate({ messages });
    const chatContentEl = $('#chat-content');
    chatContentEl.html(html)
    const scrollHeight = chatContentEl.prop('scrollHeight')
    chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
  };

  //post local message
  const postMessage = (message) => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString('en-US')
    };

    //send to all users
    webrtc.sendToAll('chat', chatMessage);
    'chat'
    messages.push(chatMessage);
    $('#post-message').val('');
    updateChatMessages();
  };

  //display chat interface
  const showChatRoom = (room) => {
    //hide formEl
    formEl.hide();
    const html = chatTemplate({ room });
    chatEl.html(html);
    const postForm = $('form');
    postForm.form({
      message: 'empty',
    });
    $('#post-btn').on('click', () => {
      const message = $('#post-message').val();
      postMessage(message);
    });
    $('#post-message').on('keyup', (event) => {
      if (event.keyCode === 13) {
        const message = $('#post-message').val();
        postMessage(message);
      }
    })
  };


  //register new chat room
  const createRoom = (roomName) => {
    console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      formEl.form('clear');
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
    });
  };

  //join existing chatroom
  const joinRoom = (roomName) => {
    console.log(`Joining Room: ${roomName}`);
    webrtc.joinRoom(roomName);
    showChatRoom(roomName);
    postMessage(`${username} joined chatroom`)
  };

  //receive messages from remote user
  webrtc.connection.on('message', (data) => {
    if (data.type === 'chat') {
      const message = data.payload;
      messages.push(message)
      updateChatMessages();
    }
  })

  //add remote video
  webrtc.on('videoAdded', (video, peer) => {
    const id = webrtc.getDomId(peer);
    const html = remoteVideoTemplate({ id });
    if (remoteVideosCount === 0) {
      remoteVideosEl.html(html);
    } else {
      remoteVideosEl.append(html);
    }
    $(`#${id}`).html(video);
    $(`#${id} video`).addClass('ui image medium');
    remoteVideosCount += 1;
  })

  $('.submit').on('click', (event) => {
    if (!formEl.form('is valid')) {
      return false;
    }
    username = $('#username').val();
    const roomName = $('#roomName').val().toLowerCase();
    if (event.target.id === 'create-btn') {
      createRoom(roomName);
    } else {
      joinRoom(roomName);
    }
    return false;
  });

});
