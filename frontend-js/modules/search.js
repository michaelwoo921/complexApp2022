import axios from 'axios';
export default class Search {
  constructor() {
    this.injectHTML();
    this.headerSearchIcon = document.querySelector('.header-search-icon');
    this.overlay = document.querySelector('.search-overlay');
    this.closeIcon = document.querySelector('.close-live-search');
    this.inputField = document.querySelector('#live-search-field');
    this.loaderIcon = document.querySelector('.circle-loader');
    this.resultsArea = document.querySelector('.live-search-results');
    this.previousValue = '';
    this.typingWaitTimer;
    this.events();
  }
  events() {
    this.inputField.addEventListener('keyup', () => {
      this.keyPressHandler();
    });
    this.closeIcon.addEventListener('click', () => {
      this.closeOverlay();
    });
    this.headerSearchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      this.openOverlay();
    });
  }

  keyPressHandler() {
    let value = this.inputField.value;
    if (value == '') {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.hideResultsArea();
    }

    if (this.previousValue != value && value != '') {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.hideResultsArea();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 3000);
    }
  }
  sendRequest() {
    axios
      .post('/search', { searchTerm: this.inputField.value })
      .then((result) => {
        console.log(result.data);
        this.renderResultsHTML(result.data);
      })
      .catch(() => alert('request failed'));
  }
  openOverlay() {
    this.overlay.classList.add('search-overlay--visible');
  }
  closeOverlay() {
    this.overlay.classList.remove('search-overlay--visible');
  }
  renderResultsHTML(posts) {
    this.resultsArea.innerHTML = `
    <div class="list-group shadow-sm">
      <div class="list-group-item active"><strong>Search Results</strong> (${
        posts.length > 1 ? `${posts.length} items found` : `1 item found`
      })</div>
      
${posts
  .map((post) => {
    let postDate = new Date(post.createdDate);
    return `
<a href="/post/${post._id}" class="list-group-item list-group-item-action">
        <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${
      post.title
    }</strong>
        <span class="text-muted small">by ${post.author.username} on ${
      postDate.getMonth() + 1
    }/${postDate.getDate()}/${postDate.getFullYear()}</span>
      </a>`;
  })
  .join(' ')}
      
    
     
  
    </div>`;
    this.hideLoaderIcon();
    this.showResultsArea();
  }

  injectHTML() {
    document.body.insertAdjacentHTML(
      'beforeend',
      `
    <!-- search feature begins -->
    <div class="search-overlay">
      <div class="search-overlay-top shadow-sm">
        <div class="container container--narrow">
          <label for="live-search-field" class="search-overlay-icon"
            ><i class="fas fa-search"></i
          ></label>
          <input
            type="text"
            id="live-search-field"
            class="live-search-field"
            placeholder="What are you interested in?"
          />
          <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
        </div>
      </div>
      <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results"></div>
      </div>
    </div>
  </div>
  <!-- search feature end -->
    `
    );
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add('circle-loader--visible');
  }
  hideLoaderIcon() {
    this.loaderIcon.classList.remove('circle-loader--visible');
  }
  showResultsArea() {
    this.resultsArea.classList.add('live-search-results--visible');
  }
  hideResultsArea() {
    this.resultsArea.classList.remove('live-search-results--visible');
  }
}
