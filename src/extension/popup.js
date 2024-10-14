document.addEventListener('DOMContentLoaded', function () {

  document.getElementById('clickable-header').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default anchor behavior
    chrome.tabs.create({ url: 'http://localhost:3000/home' });
  });
  
  // Send a message to the background script to get templates
  chrome.runtime.sendMessage({ type: 'GET_TEMPLATES' }, function (response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    if (response.error) {
      const initContainer = document.getElementById('initContainer');
      const loginContainer = document.getElementById('loginContainer');
      loginContainer.style.display = 'block';
      initContainer.style.display = 'none';

      // Setting up basic action button
      document.getElementById('loginButton').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default anchor behavior
        chrome.tabs.create({ url: 'http://localhost:3000/home' });
      });
    }
    else {
      displayTemplates(response);
      document.getElementById('stopButton').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default anchor behavior
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        document.getElementById('botRunningContainer').style.display = 'none';
        document.getElementById('templatesContainer').style.display = 'block';
        chrome.tabs.sendMessage(tab.id, { action: 'stop' });
      });
    }
    return;
  })
});

function displayTemplates(templates) {
  const templatesContainer = document.getElementById('templatesContainer');

  if (!templatesContainer) return;

  // Clear any existing content
  templatesContainer.innerHTML = '';

  templates.forEach(template => {
    const templateHTML = `
    <div class="subContainer">
      <h2 class="container-title">${template.title}</h2>
      <div class="text-container">
        <p class="text-gray-600 mb-4">${template.description}</p>
      </div>
      <button class="btn">
        <span>Launch</span>
      </button>
      <hr class="divider">
    </div>
  `;
  

    templatesContainer.insertAdjacentHTML('beforeend', templateHTML);

    // Attach event listener to the button
    templatesContainer.lastElementChild.querySelector('button').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      templatesContainer.style.display = 'none';
      document.getElementById('botRunningContainer').style.display = 'block';
      chrome.tabs.sendMessage(tab.id, { action: 'start', template: template });
    });
  });
  document.getElementById('initContainer').style.display = 'none';
  templatesContainer.style.display = 'block';
}

