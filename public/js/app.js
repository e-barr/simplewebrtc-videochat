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
  })
});
