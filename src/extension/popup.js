document.addEventListener('DOMContentLoaded', function () {
  const statusDiv = document.getElementById('status');
  const loginButton = document.getElementById('loginButton');

  // Check if user is logged in using local storage
  chrome.storage.local.get('authToken', function (result) {
    if (result.authToken) {
      statusDiv.innerText = "You are logged in.";
      planButton.style.display = 'block'
    } else {
      statusDiv.innerText = "You are not logged in.";
      loginButton.style.display = 'block';
    }
  });

  // Redirect to the web app's login page when button is clicked
  loginButton.addEventListener('click', function () {
    chrome.tabs.create({ url: 'http://localhost:3000/home' });
  });

  // Launch get plan function
  planButton.addEventListener('click', function () {
    chrome.storage.local.get('authToken', function (result) {
      if (result.authToken) {
        chrome.runtime.sendMessage({
          type: "GET_CUSTOMER",
          body: result.authToken
        })
      }
    });
  });
});
