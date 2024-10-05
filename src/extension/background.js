chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message) => {
  //console.log(message)
  if (message.type === 'LOGIN_SUCCESS') {
    // Store the token in chrome storage
    chrome.storage.local.set({ authToken: message.token }, function () {
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  console.log("runnnig GET_CUSTOMER")
  if (message.type === 'GET_CUSTOMER') {
    try {
      fetch("http://localhost:3000/api/auth/session", {
        mode: 'cors',
      })
        .then(response => response.json())
        .then((session) => {
          if (Object.keys(session).length > 0) {
            //console.log(session)
            try {
              fetch("http://localhost:3000/api/profile/plan", {
                method: "POST",
                mode: 'cors',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ "uid": session.user.uid })  // Convert the body to a JSON string
              })
                .then((response) => response.json())
                .then((session) => {
                  console.log("Plan")
                  console.log(session)
                })
                .catch(err => {
                  console.error(err);
                })
            } catch (e) {
              console.error(e)
            }
          }
        })
        .catch(err => {
          console.error(err);
        })
    } catch (e) {
      console.error(e)
    }
  }
});