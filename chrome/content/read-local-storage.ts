if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === 'get-current-user-state') {
      console.log('Reading request', localStorage.getItem('user'));
      sendResponse(localStorage.getItem('user'));
    }
  });
}
