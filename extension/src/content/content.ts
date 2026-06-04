function getProblemTitle() {
  const titleElement = document.querySelector(
    ".text-title-large"
  );

  const title = titleElement?.textContent;

  if (title) {
    chrome.storage.local.set({
      problemTitle: title,
    });

    console.log("Saved title:", title);
  }
}

getProblemTitle();