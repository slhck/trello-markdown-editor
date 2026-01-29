# Trello Markdown Editor

A Chrome extension that replaces Trello's rich text (WYSIWYG) editor with a plain markdown textarea.

## Why?

Trello's new editor auto-converts markdown syntax as you type, which can be frustrating if you:

- Already know markdown and don't need visual helpers
- Want to see and edit the raw markdown directly
- Find the auto-conversion behavior disruptive to your workflow

This extension gives you back a simple textarea where you can write markdown without any interference.

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `trello-markdown-editor` folder

## Usage

1. Open any Trello card
2. Click "Edit" on the description
3. The rich text editor will be replaced with a plain textarea
4. Write your markdown directly
5. Click "Save" to save, or "Cancel" to restore the original editor

## Features

- Plain textarea with monospace font for easy markdown editing
- Dark mode support (matches Trello's dark theme)
- Fetches existing markdown content from the card
- Saves directly via Trello's API
- Cancel button restores the original editor if needed

## Building

To create a ZIP file for Chrome Web Store submission:

```bash
zip -r trello-markdown-editor.zip manifest.json content.js styles.css icon48.png icon128.png
```

## License

Copyright (c) Werner Robitza

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
