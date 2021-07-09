# Bug Reporter Plugin
Error Reporting plugin for Just Eat for Business

## Setup
```sh
yarn install

# Copy the config files and update them to contain the relevant values
cp config/config.chrome.sample.ts config/config.chrome.ts # Backend config
cp config/config.sample.ts config/config.ts # Frontend config
```

## Build extension
1. ```sh
   yarn build
   ```
2. Go to chrome/dist
3. Zip up the contents
4. Upload to https://chrome.google.com/webstore/devconsole/g01003035587027186504/febkbciemgibpjclglbiiajaplmlenke/edit?hl=en_GB

## Run locally
```sh
yarn serve
```
This will run a build-and-watch task for serving the `background.js`, `popup.js`, and `content.js` files.

You need to then go to chrome://extensions, enable developer mode, and click "load unpacked".

Point it at the `chrome/dist` directory to load the plugin.

## Chrome extension structure
This chrome extension consists of three files:
1. `Background`: responsible for persisting state and communication with the backend.
    It's a singleton that runs all the time in the background.
2. `Popup`: contains the react frontend that appears in a popup when the extension icon is clicked.
    A new instance of it is created every time the popup is opened.
3. `Content`: a script that injects itself to JEFB website pages to pass specific data to the extension.
    The data passed is needed by the extension but it cannot otherwise access (e.g. console data).
