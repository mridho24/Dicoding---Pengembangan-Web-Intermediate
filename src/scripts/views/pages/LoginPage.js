import createLoginTemplate from "../template/Login.js";

class LoginPage {
  constructor({ error = null, isLoading = false, container }) {
    this._error = error;
    this._isLoading = isLoading;
    this._container = container;
    this._loginHandler = null;
  }

  render() {
    this._container.innerHTML = createLoginTemplate({
      error: this._error,
      isLoading: this._isLoading,
    });

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const form = document.getElementById("loginForm");
    console.log('Form found:', form); // Debug log

    if (form && !this._isLoading) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug log

        if (this._validateForm()) {
          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value;
          console.log('Form validated, email:', email); // Debug log

          if (this._loginHandler) {
            console.log('Calling login handler'); // Debug log
            this._loginHandler({ email, password });
          } else {
            console.log('No login handler attached'); // Debug log
          }
        } else {
          console.log('Form validation failed'); // Debug log
        }
      });
    } else {
      console.log('Form not found or loading:', { form, isLoading: this._isLoading }); // Debug log
    }
  }

  /**
   * Validate form before submission
   * @returns {boolean} Whether form is valid
   */
  _validateForm() {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (!email.validity.valid) {
      this._showFieldError(email, "Please enter a valid email address");
      return false;
    }

    if (password.value.length < 8) {
      this._showFieldError(
        password,
        "Password must be at least 8 characters long"
      );
      return false;
    }

    return true;
  }

  /**
   * Show form field error
   * @param {HTMLElement} field - Form field
   * @param {string} message - Error message
   */
  _showFieldError(field, message) {
    field.classList.add("form-input--error");

    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains("form-error")) {
      errorElement = document.createElement("p");
      errorElement.className = "form-error";
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = message;

    field.addEventListener(
      "input",
      () => {
        field.classList.remove("form-input--error");
        if (errorElement && errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      },
      { once: true }
    );
  }

  /**
   * Set login handler function
   * @param {Function} handler - Login handler function
   */
  setLoginHandler(handler) {
    this._loginHandler = handler;
    console.log('Login handler set:', !!handler); // Debug log
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Whether login is in progress
   */
  setLoading(isLoading) {
    this._isLoading = isLoading;

    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Logging in...'
        : '<i class="fas fa-sign-in-alt"></i> Login';
    }

    const formFields = this._container.querySelectorAll(".form-input");
    formFields.forEach((field) => {
      field.disabled = isLoading;
    });
  }

  cleanup() {
    // Nothing to clean up
  }
}

export default LoginPage;
