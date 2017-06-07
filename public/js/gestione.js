'use strict';
$(document).ready(function() {

    var configuration = {
     'iceServers': [{
       'url': 'stun:stun.l.google.com:19302',
       'url':'stun:stun.services.mozilla.com'
     }]
    };
    // {'url':'stun:stun.services.mozilla.com'}

  var socket = io.connect();
	var topic;
	var peerConn;
	var dataChannel;
	var arrayChannel = [];
  var isChannelCreated = false;
  // booleano per capire se questo client sta creando o si sta unendo alla room
	var isInitiator;
  //prendo l'utente dalla sessione
  var session={}
  
    $.ajax({
      type: "GET",
      dataType: "json",
      contentType: 'application/json; charset=utf-8',
      url: '/getUser',
      async:false
    }).done( function (data) {
      //alert(JSON.stringify(data));
      setUser(data);
    }); 

    function setUser(user) {
      session=user;
    }

	
	//fai apparire il modal 	
	$("#myModal").modal({backdrop: 'static', keyboard: false});

	//scegli la categoria
	$("#scegli").click(function(){
		var categoria= $( "#categoria option:selected" ).text();
		topic=categoria;
    $('#title-categoria').append('Categoria: ' + topic);
		if (topic !== "") {
  			console.log('Message from client: Asking to join topic ' + topic);
			socket.emit('create or join', topic);
		}
		$( "#scegli" ).attr( "data-dismiss", "modal" );
	});

	//posta un alert della notizia
	$("#sendButton").click( function(){
		var notizia= $('#notice').text();
		if(notizia=="Inserisci una notizia" || notizia=="") {
			alert("Per poter pubblicare una notizia, devi scrivere qualcosa");
		} else {
       $("#publication").append("<div class='row'><div class='col-sm-3'>"+
                          "<div class='well'>"+
                            "<p><strong>"+session.username+"</strong></p>" +
                              "</div>" +
                      "</div>" +
                      "<div class='col-sm-9'>" +
                          "<div class='well'>" +
                        "<p>"+ notizia +"</p>" +
                          "</div>"+
                      "</div>"+
                      "</div>"
                      );  
			//invio i dati
			sendData();	
		}
		
});

$(window).on("beforeunload", function() { 
   dataChannel.close();
});

//WEB SOCKET==========================================================================


socket.on('created', function(topic, clientId) {
  isInitiator = true;  
  console.log('Created room', topic, '- my client ID is', clientId);
});

// diviene ready quando secono client si connette
socket.on('ready', function() {
  if ((!isChannelCreated && !isInitiator) || isInitiator){
  console.log('Socket is ready');
  createPeerConnection(isInitiator, configuration);}
});

socket.on('full', function(topic) {
  console.log('Message from client: Topic ' + topic + ' is full :^(');
});

socket.on('ipaddr', function(ipaddr) {
  console.log('Message from client: Server IP address is ' + ipaddr);
});

socket.on('joined', function(topic, clientId) {
  isInitiator = false;
  console.log('This peer has joined room', topic, 'with client ID', clientId);
  createPeerConnection(isInitiator, configuration);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

/**
* Signaling answer/offer
*/
socket.on('message', function(message) {
  if((!isChannelCreated && !isInitiator) || isInitiator){
  console.log('Client received message:', message);
  signalingMessageCallback(message);
}
});


/**
* Send message to signaling server
*/
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}
//====================================================================================
//====================================================================================
//====================================================================================

//Creiamo un dataChannel tra i peers

function createPeerConnection(isInitiator,config) {

  console.log('Creating Peer connection as initiator?', isInitiator, 'config:',
              config);
  peerConn = new RTCPeerConnection(config);
  // send any ice candidates to the other peer

  peerConn.onicecandidate = function(event) {
      console.log('icecandidate event:', event);
      if (event.candidate) {
        sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
        });
      } else {
        console.log('End of candidates.');
      }
   };

  if (isInitiator) {
    console.log('Creating Data Channel');
    dataChannel = peerConn.createDataChannel('sendDataChannel'+ Math.floor(Math.random()*100)+1);
    onDataChannelCreated(dataChannel);
    //console.log(dataChannel.label + " " + dataChannel.readyState);
    //if(dataChannel.readyState == "open"){
    //arrayChannel.push(dataChannel);
    //}

    console.log('Creating an offer');
    peerConn.createOffer(onLocalSessionCreated, logError);
  } else {
    peerConn.ondatachannel = function(event) {
      console.log('ondatachannel:', event.channel);
      dataChannel = event.channel;
      onDataChannelCreated(dataChannel);
    };
  }

}

function onLocalSessionCreated(desc) {
    console.log('local session created:', desc);
    peerConn.setLocalDescription(desc, function() {
      console.log('sending local desc:', peerConn.localDescription);
      sendMessage(peerConn.localDescription);
    }, logError);
}

/*
* Questa funzione apre il data channel e quindi permette la ricezione dei messaggi. 
*/ 
function onDataChannelCreated(channel) {
    console.log('onDataChannelCreated:', channel);

    channel.onopen = function() {

    console.log('CHANNEL opened!!!'+ "" + channel.label);
    arrayChannel.push(channel);
    isChannelCreated = true;
    };
    
    // quando ricevo un messaggio su dataChannel eseguo DataFirefox o DataChrome Factory specificando la funzione onmessage
    channel.onmessage = (adapter.browserDetails.browser === 'firefox') ?
    receiveDataFirefoxFactory() : receiveDataChromeFactory();
}


// Handling the dat received through the channel!!!

function receiveDataChromeFactory() {

  return function onmessage(event) {

     console.log(event.data);
     var message = JSON.parse(event.data); 

     if (isInitiator) {
      for (var i = 0; i < arrayChannel.length ; i++) {
        if (arrayChannel[i].label != message.channel ){
        arrayChannel[i].send(event.data); 
        }
      }

     }

     if (typeof message.mex === 'string') {
     console.log(message.mex);
     $("#publication").append("<div class='row'><div class='col-sm-3'>"+
          								"<div class='well'>"+
           									"<p>"+message.user+"</p>" +
                     					"</div>" +
        							"</div>" +
        							"<div class='col-sm-9'>" +
          								"<div class='well'>" +
        								"<p>"+ message.mex +"</p>" +
          								"</div>"+
        							"</div>"+
      								"</div>"
      								);	
     return;
    }
    }; 
}


function receiveDataFirefoxFactory() {
    return function onmessage(event) {

     console.log(event.data);
     var message = JSON.parse(event.data); 

     if (isInitiator) {
      for (var i = 0; i < arrayChannel.length ; i++) {
        if (arrayChannel[i].label != message.channel ){
        arrayChannel[i].send(event.data); 
        }
      }

     }

     if (typeof message.mex === 'string') {
     console.log(message.mex);
     $("#publication").append("<div class='row'><div class='col-sm-3'>"+
                          "<div class='well'>"+
                            "<p>"+message.user+"</p>" +
                              "</div>" +
                      "</div>" +
                      "<div class='col-sm-9'>" +
                          "<div class='well'>" +
                        "<p>"+ message.mex +"</p>" +
                          "</div>"+
                      "</div>"+
                      "</div>"
                      );  
     return;
    }
  };
}

/**
* Function called to handle the signaling
*/

function signalingMessageCallback(message) {
  if (message.type === 'offer') {
    console.log('Got offer. Sending answer to peer.');
    peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);
    peerConn.createAnswer(onLocalSessionCreated, logError);

  } else if (message.type === 'answer') {
    console.log('Got answer.');
    peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);

  } else if (message.type === 'candidate') {
    peerConn.addIceCandidate(new RTCIceCandidate({
      candidate: message.candidate
    }));

  } else if (message === 'bye') {
// TODO: cleanup RTC connection?
  }
}

function sendData() {

  
  var notice = $('#notice').text();

  var data = { channel: dataChannel.label, mex: notice, user: session.username};
  console.log(data.mex);
  var json = JSON.stringify(data);
  console.log(json);

  console.log(arrayChannel.length);
  for (var i = 0; i < arrayChannel.length ; i++) {
  console.log(arrayChannel[i] + "    " + i);
  arrayChannel[i].send(json); 
  }
  trace('Sent Data: ' + json);
}

function logError(err) {
  console.log(err.toString(), err);
}

function trace(text) {
  if (text[text.length - 1] === '\n') {
    text = text.substring(0, text.length - 1);
  }
  if (window.performance) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ' + text);
  } else {
    console.log(text);
  }
}



});

