# Contentful Sidekick

Chrome Extension that helps end users of Contentful find the content they want to edit quickly on highly nested pages that use alot of different peices of content to make up the page.

## Download

You can download the released version on the [Chrome Web Store](https://chrome.google.com/webstore/detail/contentful-sidekick/cmheemjjmooepppggclooeejginffobo).<br>
**IMPORTANT: before you use the sidekick you must first enable it by adding html attributes to your page**

## Enabling for your site

The Contentful Sidekick uses a data attribute on the element you want to enable editing for. Typically this is placed on an elment that corrisponds to a different content model.

### Add this to your top meta tags

```html
<meta name="contentful_space" content="<space-id>" /> <meta name="contentful_environment" content="<environment>" />
```

### Add this to your HTML element

**Tip**: A good practice is to only add these tags on a staging or preview environment

```
data-csk-entry-id={entry.sys.id}
data-csk-entry-field="yourFieldApiName"
data-csk-entry-type={entry.sys.contentType.sys.id}
data-csk-entry-display-text={entry.fields.internalTitle}
```

**Note** It is highly recommended to use `data-csk-entry-display-text` for all entries. If you purely want to visually group items, you can omit the other tags. Otherwise, for best future functionality, it is best to use all the tags.

To quickly add these tags to a react app, the LastRev Sidekick Utility is recommended (link TBD once published).

Example:

```html
<div data-csk-entry-display-text="Main Modules">
  <div
    class="module-panel"
    data-csk-entry-id="js7sjsushs63h36shsgd63g"
    data-csk-entry-type="modulePanel"
    data-csk-entry-display-text="Module - Panel"
  >
    <div
      class="panel-title"
      data-csk-entry-id="js7sjsushs63h36shsgd63g"
      data-csk-entry-field="title"
      data-csk-entry-type="modulePanel"
      data-csk-entry-display-text="Title"
    >
      ...
    </div>
    <div
      class="module-text"
      data-csk-entry-id="ihsdougu33342jutnt2334"
      data-csk-entry-type="moduleText"
      data-csk-entry-display-text="Module - Text"
    >
      <div
        class="text-content"
        data-csk-entry-id="ihsdougu33342jutnt2334"
        data-csk-entry-field="bodyContent"
        data-csk-entry-type="moduleText"
        data-csk-entry-display-text="Text Body"
      >
        ...
      </div>
    </div>
  </div>
</div>
```

Your page now adds a sidebar which can be used to navigate the entries and will have edit links to each of the content items.

In the example above, you would see the following structure in your sidebar:

```
- Main Modules
  - Module - Panel [Edit]
    - Title [Edit]
  - Module - Text [Edit]
    - Text Body [Edit]
```

# Developing Locally

## Development Env Setup

- Clone Repo
- npm install
- npm start

_This will then create a watch process that will rebuild all files to /dist/chrome anytime a file changes._

## Loading into chrome

- Open [chrome://extensions/](chrome://extensions/)
- Turn Development Mode on in the upper right corner
- Choose Load Unpacked
- Navigate to _[project folder]_/dist/chrome and select the folder
- you should now see the extension in your browser

## Making changes

Even though the webpack rebuilds the files automatically, you need to refresh the extension in the [chrome://extensions/](chrome://extensions/) to make them load. TODO: Working on a solutions to automatically reload the extension

## Key files

`/src/shared/css/content.css` This is the CSS for the page styles for the sidekick <br>
`/src/shared/js/content.js` This is the JS file that adds the elements to it
