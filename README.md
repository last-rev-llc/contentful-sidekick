# Contentful Sidekick
Chrome Extension that helps end users of Contentful find the content they want to edit quickly on highly nested pages that use alot of different peices of content to make up the page.

## Download
You can download the released version on the [Chrome Web Store](https://chrome.google.com/webstore/detail/contentful-sidekick/cmheemjjmooepppggclooeejginffobo).<br>
**IMPORTANT: before you use the sidekick you must first enable it by adding html attributes to your page**

## Enabling for your site
The Contentful Sidekick uses a data attribute on the element you want to enable editing for. Typically this is placed on an elment that corrisponds to a different content model.

### Add this to your top meta tags
```html
<meta name="contentful_space" content="<space-id>">
<meta name="contentful_environment" content="<environment>">
```
### Add this to your HTML element
**Tip**: A good practice is to only add these tags on a staging or preview environment
```
data-csk-entry-id="${entry.sys.id}"
```
Example:

```html
<div class="module-panel" data-csk-entry-id="js7sjsushs63h36shsgd63g">
  <div class="panel-hsc" data-csk-entry-id="jsshs7j2y2hhgsysjjdkkfie">
    ...
  </div>

  <div class="panel-hsc" data-csk-entry-id="aksisuw7whsywhsywi28282">
    ...
    <div class="another-content-model" data-csk-entry-id="pow982kj282mm2hjsd72nwh">
      ...
    </div>
  </div>
</div>
```

Your page now highlights the elements and adds an edit button directly to the content entry in Contentful
screenshot

# Developing Locally
## Development Env Setup
- Clone Repo
- npm install
- npm start

*This will then create a watch process that will rebuild all files to /dist/chrome anytime a file changes.*

## Loading into chrome
- Open [chrome://extensions/](chrome://extensions/)
- Turn Development Mode on in the upper right corner
- Choose Load Unpacked
- Navigate to *[project folder]*/dist/chrome and select the folder
- you should now see the extension in your browser

## Making changes
Even though the webpack rebuilds the files automatically, you need to refresh the extension in the [chrome://extensions/](chrome://extensions/) to make them load. TODO: Working on a solutions to automatically reload the extension

## Key files
`/src/shared/css/content.css` This is the CSS for the page styles for the sidekick <br>
`/src/shared/js/content.js` This is the JS file that adds the elements to it
