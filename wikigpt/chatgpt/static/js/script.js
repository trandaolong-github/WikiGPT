var OpenAiApiKey = localStorage.getItem('OpenAiApiKey') || '';
const messagesContainer = document.querySelector('#messages');
const messageInput = document.querySelector('#message-input');
var prompt = ''

function setPrompt(prompt_input) {
    prompt = prompt_input
}

window.addEventListener('DOMContentLoaded', () => {
  if (OpenAiApiKey) {
    $('#enter-api-key').hide()
    $('#remove-api-key').show()
    $('#main-functions').show()
  } else {
    $('#enter-api-key').show()
    $('#remove-api-key').hide()
    $('#main-functions').hide()
  }
});

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
            url = "https://api.openai.com/v1/chat/completions"
            data = {"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt + message}]}
        } else {
        url = "dummyurl"
        }
        postData(
        url, OpenAiApiKey, data
        )
        .then(data => {
            receiveMessage('Bot', data.choices[0].message.content);
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
    } else if (e.code === 'Enter') {
        console.log
        handleSendEvent(e)
    }
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
    // Assign raw data, otherwise html doc will be translated, similar for receiveMessage
    messageP.innerHTML = message;
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(messageP);
    
    messagesContainer.appendChild(messageDiv);
}

function receiveMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'other-message');
    
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('sender');
    senderSpan.textContent = sender;
    
    message = message.replace(/```([\s\S]*?)```/g, '<pre><code style="overflow-x:auto;">$1</code></pre>');
    message = message.replace(/\n\n/, "");
    message = message.replace(/\n\n/g, "<br><br>");
    message = message.replace(/`([\s\S]*?)`/g, '<i><b>$1</b></i>');
    const paragraph = document.createElement('div')
    paragraph.classList.add('message-text')
    paragraph.innerHTML = message

    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(paragraph);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

function removeApiKey() {
  localStorage.removeItem('OpenAiApiKey');
  OpenAiApiKey = '';
  $('#remove-api-key-popup').modal('toggle');
  $('#enter-api-key').show()
  $('#remove-api-key').hide()
  $('#main-functions').hide()
}

function saveApiKey() {
  var key = document.getElementById("api-key-input-box").value;
  if (key) {
    OpenAiApiKey = key;
    localStorage.setItem('OpenAiApiKey', OpenAiApiKey);
    $('#api-key-popup').modal('toggle');
    $('#enter-api-key').hide()
    $('#remove-api-key').show()
    $('#main-functions').show()
  }
}
