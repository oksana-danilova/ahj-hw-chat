/* eslint-disable no-console */
import getCreationDate from './getCreationDate';

export default class Chat {
  constructor(container, activeUser) {
    this.container = container;
    this.activeUser = activeUser;
  }

  renderConnectionUser(user) {
    const connectionContainer = document.querySelector('.connection-container');

    const connectionRow = document.createElement('UL');
    const liPreview = document.createElement('LI');
    const connectionPreview = document.createElement('DIV');
    const liUser = document.createElement('LI');
    const connectionUser = document.createElement('P');

    connectionRow.classList.add('connection-row');
    connectionPreview.classList.add('connection-prewiew');
    connectionUser.classList.add('connection-user');

    if (user === this.activeUser) {
      connectionUser.classList.add('you');
      connectionUser.textContent = `${user} (You)`;

      window.onbeforeunload = async () => {
        const query = `subscriptions/${encodeURIComponent(this.activeUser)}`;
        console.log(query);
        fetch(`https://ahj-hw8-1-backend.onrender.com/${query}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      };
    } else {
      connectionUser.textContent = user;
    }

    connectionContainer.appendChild(connectionRow);
    connectionRow.append(liPreview);
    liPreview.append(connectionPreview);
    connectionRow.append(liUser);
    liUser.append(connectionUser);
  }

  static removeDisconnectionUser(user) {
    const connectionUserArray = Array.from(document.querySelectorAll('.connection-user'));

    const removeUser = connectionUserArray.find((item) => item.textContent === user);
    if (removeUser) {
      removeUser.closest('.connection-row').remove();
    }
  }

  async renderChat() {
    const connectionContainer = document.createElement('DIV');

    const chatContainer = document.createElement('DIV');
    const chat = document.createElement('DIV');
    const chatSend = document.createElement('FORM');
    const chatMessage = document.createElement('INPUT');

    chatContainer.classList.add('chat-container');
    chat.classList.add('chat');
    chatSend.classList.add('chat-send');
    chatMessage.classList.add('chat-message');

    chatMessage.placeholder = 'Type some text';

    this.container.appendChild(chatContainer);
    chatContainer.append(chat);
    chatSend.append(chatMessage);
    chatContainer.append(chatSend);

    connectionContainer.classList.add('connection-container');
    this.container.appendChild(connectionContainer);

    this.messaging();

    const request = fetch('https://ahj-hw8-1-backend.onrender.com/index/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await request;

    if (!result.ok) {
      console.error('Ошибка');

      return;
    }

    const json = await result.json();

    if (json) {
      json.forEach((item) => {
        this.renderConnectionUser(item.nickname);
      });
    }

    this.gettingUsers();
  }

  renderMessage(autor, text) {
    const chat = document.querySelector('.chat');
    const boxMessage = document.createElement('DIV');
    const information = document.createElement('SPAN');
    const message = document.createElement('P');

    boxMessage.classList.add('message-container');
    information.classList.add('message-information');
    message.classList.add('message-text');

    const dateCreate = getCreationDate();

    if (autor === this.activeUser) {
      boxMessage.classList.add('right-align');
      information.classList.add('you-message');
      information.textContent = `${autor} (You), ${dateCreate}`;
      message.textContent = text;
    } else {
      information.textContent = `${autor}, ${dateCreate}`;
      message.textContent = text;
    }

    chat.appendChild(boxMessage);
    boxMessage.append(information);
    boxMessage.append(message);
  }

  gettingUsers() {
    const eventSource = new EventSource('https://ahj-hw8-1-backend.onrender.com/sse');

    eventSource.addEventListener('open', (e) => {
      console.log(e);

      console.log('sse open');
    });

    eventSource.addEventListener('error', (e) => {
      console.log(e);

      console.log('sse error');
    });

    eventSource.addEventListener('message', (e) => {
      console.log(e);
      const { nickname, req } = JSON.parse(e.data);

      if (req === 'add') {
        this.renderConnectionUser(nickname);
      }
      if (req === 'remove') {
        Chat.removeDisconnectionUser(nickname);
      }

      console.log('sse message');
    });
  }

  messaging() {
    const ws = new WebSocket('wss://ahj-hw8-1-backend.onrender.com/ws');

    const chatMessage = document.querySelector('.chat-message');
    const chatSend = document.querySelector('.chat-send');

    chatSend.addEventListener('submit', (e) => {
      e.preventDefault();

      const message = {};

      message.autor = this.activeUser;
      message.text = chatMessage.value;

      if (!message) return;
      ws.send(JSON.stringify(message));
      chatMessage.value = '';
    });

    ws.addEventListener('open', (e) => {
      console.log(e);

      console.log('ws open');
    });

    ws.addEventListener('close', (e) => {
      console.log(e);

      console.log('ws close');
    });

    ws.addEventListener('error', (e) => {
      console.log(e);

      console.log('ws error');
    });

    ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      const { chat: messages } = data;
      messages.forEach((message) => {
        const { autor } = JSON.parse(message);
        const { text } = JSON.parse(message);

        this.renderMessage(autor, text);
      });

      console.log('ws message');
    });
  }
}
