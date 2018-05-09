import { DebugManager } from './debug-manager';

(() => {
  function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    s.setAttribute('id', 'cp-bug-content-script');
    th.appendChild(s);
  }

  // If we're in the content script setup, we won't be able to access the window variables.
  // Re-inject ourselves so we can do it properly.

  if (!document.getElementById('cp-bug-content-script')) {
    injectScript( chrome.extension.getURL('/js/content.js'), 'body');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request === 'get-cp-debug-data') {
        window.document.dispatchEvent(new CustomEvent('get-cp-debug-data'));
        const area = window.document.getElementById('__cp-debug-data') as HTMLTextAreaElement;
        const value = area && area.value || '';
        window.document.dispatchEvent(new CustomEvent('cleanup-cp-debug-data'));
        sendResponse(value);
      }
    });
  } else {
    window.document.addEventListener('get-cp-debug-data', () => {
      const area = document.createElement('textarea');
      area.style.display = 'none';
      area.id = '__cp-debug-data';
      area.value = debugManager.getLog();
      document.body.appendChild(area);
    });
    window.document.addEventListener('cleanup-cp-debug-data', () => {
      const area = document.getElementById('__cp-debug-data') as HTMLTextAreaElement;
      if (area) {
        area.parentElement && area.parentElement.removeChild(area);
      }
    });

    // THIS IS WHERE THE MAGIC HAPPENS
    const debugManager = new DebugManager();
    debugManager.init();
  }

})();
