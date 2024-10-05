// Listening for messages from the web page
window.addEventListener('message', (event) => {
  console.log("received")
  if (event.source !== window) return; // Only accept messages from the same frame

  if (event.data.type && event.data.type === 'LOGIN_SUCCESS') {
    // Forward the message to the background script
    chrome.runtime.sendMessage(
      {
        type: 'LOGIN_SUCCESS',
        token: event.data.token,
      },
      (response) => {
        console.log('Response from background script:', response);
      }
    );
  }
});
