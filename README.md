# citypantry-error-plugin
Error Handling plugin for CityPantry.com

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
