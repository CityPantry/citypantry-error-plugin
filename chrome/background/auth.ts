let token: string;

export function getAuthToken(force?: boolean, silent: boolean = false): Promise<string> {
  if (token && !force) {
    return Promise.resolve(token);
  }

  return new Promise((resolve) => {
    chrome.identity.getAuthToken({
      interactive: !silent
    }, (_token: string) => {
      console.log('Token retrieved: ', _token.substr(0, 10) + '…');
      token = _token;
      resolve(token);
    });
  });
}
