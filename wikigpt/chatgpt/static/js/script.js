const messagesContainer = document.querySelector('#messages');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const freeURL = document.getElementById("FREE_URL");

var OpenAiApiKey = localStorage.getItem('OpenAiApiKey') || '';

window.addEventListener('DOMContentLoaded', () => {
  if (OpenAiApiKey) {
    $('#enter-api-key').hide()
    $('#select-char').show()
    $('#remove-api-key-button').show()
  } else {
    $('#enter-api-key').show()
    $('#select-char').hide()
    $('#remove-api-key-button').hide()
  }
});

function removeApiKey() {
  localStorage.removeItem('OpenAiApiKey');
  OpenAiApiKey = '';
  $('#enter-api-key').show()
  $('#select-char').hide()
  $('#remove-api-key-button').hide()
  $('#remove-api-key-popup').hide()
  // messagesContainer.innerHTML = ''; // clear chat history
}

function showApiKeyPopup() {
  var popup = document.getElementById("api-key-popup");
  popup.style.display = "block";
}

function hideApiKeyPopup() {
  $('#api-key-popup').hide()
}

function saveApiKey() {
  var key = document.getElementById("api-key-input-box").value;
  if (key) {
    OpenAiApiKey = key;
    localStorage.setItem('OpenAiApiKey', OpenAiApiKey);
    hideApiKeyPopup()
    $('#enter-api-key').hide()
    $('#select-char').show()
    $('#remove-api-key-button').show()
  }
}

async function postData(url = "", apiKey, data = {}) {
  var headers = {'Content-Type': 'application/json'}
  if(apiKey) {
    headers['Authorization'] = 'Bearer ' + apiKey,
    headers['temperature'] = 0.7
  }
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  if(!response.ok) {
    if(!apiKey) {
      throw new Error("OpenAI currently not available. Please try again later or use your own API Key")
    } else {
      throw new Error("OpenAI currently not available !")
    }
  }
  return response.json()
}

function handleSendEvent(e){
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message !== '') {
    sendMessage('You', message);
    messageInput.value = '';

    // Add waiting message
    const waitingMessage = document.createElement('div');
    waitingMessage.classList.add('message', 'waiting-message');
    waitingMessage.textContent = 'Waiting for response...';
    messagesContainer.appendChild(waitingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    var url = ""
    const selectedValue = $('#character-selection').val()
    if(OpenAiApiKey) {
      if (selectedValue == "chat") {
        url = "https://api.openai.com/v1/chat/completions"
        data = {"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": message}]}
      } else {
        url = "https://api.openai.com/v1/images/generations"
        data = {"prompt": message, "n": 1, "size": "512x512"}
      }
    } else {
      url = freeURL.value
    }
    postData(
      url, OpenAiApiKey, data
    )
    .then(data => {
      if (selectedValue == "chat") {
        receiveMessage('Bot', data.choices[0].message.content);
      } else {
        receiveImage('Bot', data.data[0].url) 
      }
    })
    .catch(error => {
      receiveMessage('Bot', error.message)
      console.error(error)
    })
    .finally(() => {
      // Remove waiting message
      messagesContainer.removeChild(waitingMessage);
    });
  }
}

messageInput.addEventListener('keydown', (e) => {
  if (e.altKey && e.code === 'Enter') {
    messageInput.value += '\n';
  } else if (e.code === 'Enter' && !e.shiftKey) {
    handleSendEvent(e)
  }
});

sendButton.addEventListener('click', (e) => {
  handleSendEvent(e)
});

function sendMessage(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'own-message');
  
  const senderSpan = document.createElement('span');
  senderSpan.classList.add('sender');
  senderSpan.textContent = sender;
  
  const messageP = document.createElement('div');
  messageP.classList.add('message-text');
  message = message.replace(/\n/g, "<br>");
  messageP.innerHTML = message;
  
  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(messageP);
  
  messagesContainer.appendChild(messageDiv);
  //messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function receiveMessage(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'other-message');
  
  const senderSpan = document.createElement('span');
  senderSpan.classList.add('sender');
  senderSpan.textContent = sender;
  
  // const messageP = document.createElement('p');
  // messageP.classList.add('message-text');
  // messageP.textContent = message;
  
  // Replace single new lines with <br> tags: 
  //message = message.replace(/(?<!\n)\n(?!\n)/g, "<br>"); 
  // Replace triple backticks with <code> tags: 
  message = message.replace(/```([\s\S]*?)```/g, '<pre><code style="overflow-x:auto;">$1</code></pre>');
  // Replace consecutive new lines with <br> tags:
  message = message.replace(/\n\n/, "");
  message = message.replace(/\n\n/g, "<br><br>");
  message = message.replace(/`([\s\S]*?)`/g, '<i><b>$1</b></i>');
  // if(message.trim().startsWith('<br><br>')) {
  //   message = message.split(/<br><br>(.*)/s)[1];
  // }
  const paragraph = document.createElement('div')
  paragraph.classList.add('message-text')
  paragraph.innerHTML = message

  messageDiv.appendChild(senderSpan);
  //messageDiv.appendChild(messageP);
  messageDiv.appendChild(paragraph);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function receiveImage(sender, url) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'other-message');
  
  const senderSpan = document.createElement('span');
  senderSpan.classList.add('sender');
  senderSpan.textContent = sender;

  const imgElement = document.createElement('img');
  imgElement.classList.add('content');
  imgElement.setAttribute('src', url);

  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(imgElement);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
var recognizing = false;

const listenButton = document.querySelector('#listen-button');

function startListening() {
  if (recognizing) {
    recognition.stop();
  } else {
    recognition.start();
  }
  // navigator.mediaDevices.getUserMedia({ audio: true })
  // .then(() => {
  //   listenButton.classList.remove('disabled');
  // })
  // .catch(e => {
  //   console.error(e);
  // });
}

recognition.addEventListener('result', e => {
  var transcript = ""
  for (var i = e.resultIndex; i < e.results.length; ++i) {
    transcript += e.results[i][0].transcript;
  }
  // const transcript = e.results[0][0].transcript;
  messageInput.value = transcript;
});

recognition.onstart = function() {
  recognizing = true;
};

recognition.onend = function() {
  recognizing = false;
};

listenButton.addEventListener('click', e => {
  startListening();
});
