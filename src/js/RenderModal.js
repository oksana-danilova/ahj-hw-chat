/* eslint-disable no-console */
import Chat from './Chat';
import Tooltip from './Tooltip';

export default class RenderModal {
  constructor(container) {
    this.container = container;
    this.tooltipFactory = new Tooltip();
  }

  enterUser() {
    const modalContainer = document.createElement('DIV');
    const titleModal = document.createElement('H1');
    const formModal = document.createElement('FORM');
    const inputModal = document.createElement('INPUT');
    const buttonModal = document.createElement('BUTTON');

    modalContainer.classList.add('modal-container');
    titleModal.classList.add('modal-title');
    formModal.classList.add('modal-form');
    inputModal.classList.add('modal-input');
    buttonModal.classList.add('modal-button');

    formModal.setAttribute('novalidate', true);
    inputModal.setAttribute('required', true);
    inputModal.name = 'nickname';
    inputModal.setCustomValidity('');

    titleModal.textContent = 'Выберите псевдоним';
    buttonModal.textContent = 'Продолжить';

    this.container.appendChild(modalContainer);
    modalContainer.append(titleModal);
    formModal.append(inputModal);
    formModal.append(buttonModal);
    modalContainer.append(formModal);

    let actualMessages = [];

    const showTooltip = (message, el) => {
      actualMessages.push({
        name: el.name,
        id: this.tooltipFactory.showTooltip(message, el),
      });
    };

    formModal.addEventListener('submit', async (e) => {
      e.preventDefault();

      actualMessages.forEach((message) => this.tooltipFactory.removeTooltip(message.id));
      actualMessages = [];

      let request;
      let result;
      let json;

      request = fetch('https://ahj-hw8-1-backend.onrender.com/index/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      RenderModal.generationLoading(modalContainer);

      result = await request;

      if (!result.ok) {
        console.error('Ошибка');

        return;
      }

      json = await result.json();

      if (json) {
        json.forEach((item) => {
          if (item.nickname === inputModal.value) {
            inputModal.setCustomValidity('customError');
          } else {
            inputModal.setCustomValidity('');
          }
        });
      }

      if (formModal.checkValidity()) {
        const nickname = inputModal.value;

        const chat = new Chat(this.container, nickname);

        request = fetch('https://ahj-hw8-1-backend.onrender.com/subscriptions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nickname }),
        });

        result = await request;

        if (!result.ok) {
          console.error('Ошибка');

          return;
        }

        json = await result.json();
        const { status } = json;

        if (status === 'OK') {
          modalContainer.classList.add('display-none');
          chat.renderChat();
        }
      } else {
        const error = RenderModal.getError(inputModal);

        if (error) {
          showTooltip(error, inputModal);
        }
      }
    });

    const elementOnBlur = (e) => {
      const el = e.target;

      const error = RenderModal.getError(el);
      if (error) {
        showTooltip(error, el);
      } else {
        const currentErrorMessage = actualMessages.find((item) => item.name === el.name);

        if (currentErrorMessage) {
          this.tooltipFactory.removeTooltip(currentErrorMessage.id);
        }
      }

      el.removeEventListener('blur', elementOnBlur);
    };

    inputModal.addEventListener('focus', () => {
      inputModal.addEventListener('blur', elementOnBlur);
    });
  }

  static getError(el) {
    const spinner = document.querySelector('.loadingio-spinner-spinner-ugc4sg2wum');
    if (spinner) {
      spinner.remove();
    }
    const errors = {
      nickname: {
        valueMissing: 'Заполните, пожалуйста, поле "Псевдоним"',
        customError: 'Этот псевдоним занят, придумайте другой',
      },
    };

    const errorKey = Object.keys(ValidityState.prototype).find((key) => {
      if (!el.name) return null;
      if (key === 'valid') return null;

      if (el.validity[key]) console.log(key);

      return el.validity[key];
    });

    if (!errorKey) return null;

    return errors[el.name][errorKey];
  }

  static generationLoading(container) {
    if (!document.querySelector('.loadingio-spinner-spinner-tujwj150y7p')) {
      const imageContainer = document.createElement('DIV');
      const animation = document.createElement('DIV');

      imageContainer.classList.add('loadingio-spinner-spinner-tujwj150y7p');
      animation.classList.add('ldio-ap4vnen1k9u');

      container.appendChild(imageContainer);
      imageContainer.append(animation);
      for (let i = 12; i !== 0; i -= 1) {
        animation.append(document.createElement('DIV'));
      }
    }
  }
}
