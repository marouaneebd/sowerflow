let isRunning = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    console.log("running bot");
    if (!isRunning) {
      isRunning = true;
      main();
    }
  } else if (request.action === 'stop') {
    console.log("stopping bot");
    isRunning = false;
  }
});

async function main() {
  let addedProfiles = [];

  while (isRunning && addedProfiles.length <= 15) {
    // Check if stopped immediately
    if (!isRunning) return;

    await sleepInterruptible(Math.random() * 1000 * 3);
    await autoScrollInterruptible(50);
    const newContacts = await addContactsInterruptible();
    addedProfiles.push(...newContacts);

    const nextButton = document.querySelector('button[aria-label="Next"]');
    if (nextButton) {
      nextButton.click();
      console.log(addedProfiles.length);
      await sleepInterruptible(5000); // Wait for the next page to load
    } else {
      console.log('No more pages');
      break;
    }

    // Break out if stop is triggered
    if (!isRunning) return;
  }

  console.log(addedProfiles);
  isRunning = false; // Reset after stopping
}

function sleepInterruptible(ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve();
    }, ms);
    const checkInterval = 100; // Check every 100ms if stopped

    const stopCheck = setInterval(() => {
      if (!isRunning) {
        clearTimeout(timer);
        clearInterval(stopCheck);
        resolve(); // Resolve early if stopped
      }
    }, checkInterval);
  });
}

async function autoScrollInterruptible(maxScrolls) {
  await new Promise((resolve) => {
    let totalHeight = 0;
    const distance = 100;
    let scrolls = 0;
    const timer = setInterval(() => {
      if (!isRunning) {
        clearInterval(timer);
        resolve(); // Stop immediately if isRunning is false
        return;
      }

      const scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;
      scrolls++;

      if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
        clearInterval(timer);
        resolve();
      }
    }, Math.random() * 1000);
  });
}

async function addContactsInterruptible() {
  let addedContacts = [];

  const containers = document.querySelectorAll('.reusable-search__result-container');

  for (const container of containers) {
    // Check if stopped before every critical action
    if (!isRunning) return addedContacts;

    const connectButton = container.querySelector('.artdeco-button--secondary');
    const titleElement = container.querySelector('span[aria-hidden="true"]');
    const linkElement = container.querySelector('a.app-aware-link');

    const action = connectButton?.textContent?.trim();
    const name = titleElement?.textContent?.trim();
    const url = linkElement?.href?.trim();

    if (name && url && action === "Connect") {
      connectButton.click();
      await sleepInterruptible(Math.random() * 1000 * 5);

      const addNoteButton = document.querySelector('button[aria-label="Add a note"]');
      if (addNoteButton) {
        addNoteButton.click();
        await sleepInterruptible(Math.random() * 1000 * 10);

        const customMessage = `Bonjour ${name.split(" ")[0]},\n\nJ'ai développé un logiciel permettant de générer des signaux de vente et de churn en suivant les contacts d'une entreprise. Je le propose gratuitement pour le moment.\n\nEst-ce que cela pourrait vous intéresser ?\n\nMerci pour votre aide,\n\nMarouane`;

        let messageTextArea = document.querySelector('#custom-message');
        while (!messageTextArea && isRunning) {
          await sleepInterruptible(500);
          messageTextArea = document.querySelector('#custom-message');
        }

        if (!isRunning) return addedContacts; // Stop if needed

        messageTextArea.value = customMessage;
        messageTextArea.dispatchEvent(new Event('input', { bubbles: true }));
        await sleepInterruptible(Math.random() * 1000 * 10 * 5);

        const sendInvitationButton = document.querySelector('button[aria-label="Send invitation"]');
        sendInvitationButton.click();
        await sleepInterruptible(Math.random() * 1000 * 5);

        addedContacts.push({ name, action, url });
      }
    }

    // Check again before proceeding to next contact
    if (!isRunning) return addedContacts;
  }

  return addedContacts;
}
