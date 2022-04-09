import axios from 'axios';

export default class RegistrationForm {
  constructor() {
    this._csrf = document.querySelector('[name="_csrf"]').value;
    this.form = document.querySelector('#registration-form');
    this.allFields = document.querySelectorAll(
      '#registration-form .form-control'
    );

    this.insertValidationElements();
    this.username = document.querySelector('#username-register');
    this.email = document.querySelector('#email-register');
    this.password = document.querySelector('#password-register');
    this.username.previousValue = '';
    this.email.previousValue = '';
    this.password.previousValue = '';
    this.username.isUnique = false;
    this.email.isUnique = false;
    this.events();
  }

  events() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.formSubmitHandler();
    });
    this.username.addEventListener('keyup', () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
    this.email.addEventListener('keyup', () => {
      this.isDifferent(this.email, this.emailHandler);
    });
    this.password.addEventListener('keyup', () => {
      this.isDifferent(this.password, this.passwordHandler);
    });
    this.username.addEventListener('blur', () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
    this.email.addEventListener('blur', () => {
      this.isDifferent(this.email, this.emailHandler);
    });
    this.password.addEventListener('blur', () => {
      this.isDifferent(this.password, this.passwordHandler);
    });
  }

  formSubmitHandler() {
    this.usernameImmediately();
    this.usernameAfterDelay();
    this.emailAfterDelay();
    this.passwordImmediately();
    this.passwordAfterDelay();

    if (
      this.username.isUnique &&
      !this.username.errors &&
      this.email.isUnique &&
      !this.email.errors &&
      !this.password.errors
    ) {
      this.form.submit();
    }
  }

  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this);
    }

    el.previousValue = el.value;
  }

  usernameHandler() {
    this.username.errors = false;
    this.usernameImmediately();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => {
      this.usernameAfterDelay();
    }, 800);
  }

  passwordHandler() {
    this.password.errors = false;
    this.passwordImmediately();
    clearTimeout(this.password.timer);
    this.password.timer = setTimeout(() => {
      this.passwordAfterDelay();
    }, 800);
  }

  emailHandler() {
    this.email.errors = false;
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => {
      this.emailAfterDelay();
    }, 800);
  }

  usernameImmediately() {
    if (
      this.username.value != '' &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.value)
    ) {
      this.showValidationError(
        this.username,
        'Username can only contain letters and numbers'
      );
    }
    if (this.username.value.length > 30) {
      this.showValidationError(
        this.username,
        'Username cannot exceed 30 characters'
      );
    }

    if (!this.username.errors) {
      this.hideValidationErrors(this.username);
    }
  }
  passwordImmediately() {
    if (this.password.value.length > 50) {
      this.showValidationError(
        this.password,
        'Password cannot exceed 50 characters'
      );
    }

    if (!this.password.errors) {
      this.hideValidationErrors(this.password);
    }
  }
  showValidationError(el, message) {
    el.nextElementSibling.innerHTML = message;
    el.nextElementSibling.classList.add('liveValidateMessage--visible');
    el.nextElementSibling.classList.add('liveValidateMessage--visible');
    el.errors = true;
  }
  hideValidationErrors(el) {
    el.nextElementSibling.classList.remove('liveValidateMessage--visible');
  }
  emailAfterDelay() {
    if (!/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationError(this.email, 'You must provide a valid email');
    }

    if (!this.email.errors) {
      axios
        .post('/doesEmailExist', { email: this.email.value, _csrf: this._csrf })
        .then((response) => {
          if (response.data) {
            this.showValidationError(this.email, 'That email is already taken');
            this.email.isUnique = false;
          } else {
            this.email.isUnique = true;
            this.hideValidationErrors(this.email);
          }
        })
        .catch(() => {
          console.log('Please try again later');
        });
    }
  }
  usernameAfterDelay() {
    if (this.username.value.length < 3) {
      this.showValidationError(
        this.username,
        'Username must be at least 3 characters'
      );
    }

    if (!this.username.errors) {
      axios
        .post('/doesUsernameExist', {
          username: this.username.value,
          _csrf: this._csrf,
        })
        .then((response) => {
          if (response.data) {
            this.showValidationError(
              this.username,
              'That username is already taken'
            );
            this.username.isUnique = false;
          } else {
            this.hideValidationErrors(this.username);
            this.username.isUnique = true;
          }
        })
        .catch(() => {
          console.log('Please try again later');
        });
    }
  }

  passwordAfterDelay() {
    if (this.password.value.length < 12) {
      this.showValidationError(
        this.password,
        'Password must be at least 12 characters'
      );
    }
  }

  insertValidationElements() {
    this.allFields.forEach(function (el) {
      el.insertAdjacentHTML(
        'afterend',
        '<div class="alert alert-danger small liveValidateMessage"></div>'
      );
    });
  }
}
