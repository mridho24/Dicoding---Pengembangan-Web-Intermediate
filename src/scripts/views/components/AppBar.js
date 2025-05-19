import authRepository from "../../data/Authentcation-Rep.js";
import "../../components/NotificationToggle.js";

class AppBar extends HTMLElement {
  constructor() {
    super();

    this._isAuthenticated = authRepository.isAuthenticated();

    this._handleAuthChange = this._handleAuthChange.bind(this);
    this._handleLogout = this._handleLogout.bind(this);
    this._handleMenuToggle = this._handleMenuToggle.bind(this);
    this._handleHomeClick = this._handleHomeClick.bind(this);
    this._handleSavedStoriesClick = this._handleSavedStoriesClick.bind(this);
  }

  connectedCallback() {
    this.render();

    window.addEventListener("user-logged-in", this._handleAuthChange);
    window.addEventListener("user-logged-out", this._handleAuthChange);

    this._attachEventListeners();
  }

  disconnectedCallback() {
    window.removeEventListener("user-logged-in", this._handleAuthChange);
    window.removeEventListener("user-logged-out", this._handleAuthChange);

    const menuToggle = this.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.removeEventListener("click", this._handleMenuToggle);
    }

    const logoutButton = this.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.removeEventListener("click", this._handleLogout);
    }
  }

  render() {
    const userData = authRepository.getUserData() || {};

    this.innerHTML = `
      <nav class="app-nav">
        <div class="app-nav__brand">
          <a href="#/" class="app-nav__title">
            <i class="fas fa-feather-alt"></i>
            <span>Cerita Kita</span>
          </a>
        </div>
        
        <button class="menu-toggle" aria-label="Toggle menu">
          <i class="fas fa-bars"></i>
        </button>
        
        <ul class="app-nav__list ${this._isAuthenticated ? "" : "app-nav__list--guest"}">
          ${this._isAuthenticated
        ? `
                <li class="app-nav__item">
                  <button class="app-nav__button app-nav__button--primary">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                  </button>
                </li>
                <li class="app-nav__item">
                  <notification-toggle></notification-toggle>
                </li>
                <li class="app-nav__item">
                  <button class="app-nav__button app-nav__button--primary">
                    <i class="fas fa-bookmark"></i>
                    <span>Saved Stories</span>
                  </button>
                </li>
                <li class="app-nav__item">
                  <button class="app-nav__button app-nav__button--primary">
                    <i class="fas fa-user-circle"></i>
                    <span>${userData.name || "User"}</span>
                  </button>
                </li>
                <li class="app-nav__item">
                  <button id="logoutButton" class="app-nav__button app-nav__button--danger">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </li>
              `
        : `
                <li class="app-nav__item">
                  <a href="#/login" class="app-nav__link">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                  </a>
                </li>
                <li class="app-nav__item">
                  <a href="#/register" class="app-nav__link app-nav__link--register">
                    <i class="fas fa-user-plus"></i>
                    <span>Register</span>
                  </a>
                </li>
              `
      }
        </ul>
      </nav>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const logoutButton = this.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", this._handleLogout);
    }

    const menuToggle = this.querySelector(".menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", this._handleMenuToggle);
    }

    const homeButton = this.querySelector(".app-nav__button--primary");
    if (homeButton) {
      homeButton.addEventListener("click", this._handleHomeClick);
    }

    // Fix Saved Stories button click handler
    const savedStoriesButton = this.querySelector(".app-nav__item:nth-child(3) .app-nav__button");
    if (savedStoriesButton) {
      savedStoriesButton.addEventListener("click", this._handleSavedStoriesClick);
    }
  }

  _handleHomeClick() {
    window.location.hash = "#/";
    window.location.reload();
  }

  _handleSavedStoriesClick() {
    window.location.hash = "#/saved-stories";
  }

  _handleAuthChange() {
    this._isAuthenticated = authRepository.isAuthenticated();
    this.render();
  }

  _handleLogout(event) {
    event.preventDefault();
    authRepository.logout();
    window.location.hash = "#/login";
  }

  _handleMenuToggle() {
    const navList = this.querySelector(".app-nav__list");
    navList.classList.toggle("app-nav__list--open");
  }
}

customElements.define("app-bar", AppBar);

export default AppBar;
