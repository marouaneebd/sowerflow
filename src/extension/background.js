chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("running GET_TEMPLATES");
  if (message.type === 'GET_TEMPLATES') {
    (async () => {
      try {
        const response = await fetch("http://localhost:3000/api/templates");
        const data = await response.json();
        sendResponse(data.listTemplates);
      } catch (e) {
        sendResponse({ error: e.message });
      }
    })();
    return true; // Indicates that sendResponse will be called asynchronously
  }
});