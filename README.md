# contentful-sidekick
Chrome Extension that enables inline editing for websites created in Contentful

## Development Env Setup
- Clone Repo
- npm install
- npm start

This will then create a watch process that will rebuild all files to /dist/chrome anytime a file changes.

## loading into chrome
- Open [chrome://extensions/](chrome://extensions/)
- turn Development Mode on in the upper right corner
- Choose Load Unpacked
- Navigate to *project folder*/dist/chrome and select the folder
- you should now see the extension in your browser

## Making changes
Even though the webpack rebuilds the files automatically, you need to refresh the extension in the [chrome://extensions/](chrome://extensions/) to make them load. TODO: Working on a solutions to automatically reload the extension

## Key files
`/src/shared/css/content.css` This is the CSS for the page styles for the sidekick
`/src/shared/js/content.js` This is the JS file that adds the elements to it

## PR for testing
https://stage-marketing-pr-730.herokuapp.com/modules



