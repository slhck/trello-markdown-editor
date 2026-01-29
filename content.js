// Trello Markdown Editor - Content Script
// Replaces Trello's rich text editor with a plain markdown textarea

(function() {
  'use strict';

  const REPLACED_ATTR = 'data-md-editor-replaced';

  // Extract card short link from URL
  function getCardShortLink() {
    const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Get CSRF token from Trello cookie
  function getCsrfToken() {
    const match = document.cookie.split(';').find(c => c.trim().startsWith('dsc='));
    return match ? match.split('=')[1] : null;
  }

  // Fetch card description via Trello API
  async function fetchCardDescription(shortLink) {
    try {
      const response = await fetch(`https://trello.com/1/cards/${shortLink}?fields=desc`);
      if (!response.ok) throw new Error('Failed to fetch card');
      const data = await response.json();
      return data.desc || '';
    } catch (err) {
      console.error('[Trello MD Editor] Error fetching description:', err);
      return null;
    }
  }

  // Save card description via Trello API
  async function saveCardDescription(shortLink, desc) {
    try {
      const dsc = getCsrfToken();
      if (!dsc) {
        console.error('[Trello MD Editor] No CSRF token found');
        return false;
      }
      const response = await fetch(`https://trello.com/1/cards/${shortLink}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ desc, dsc }),
      });
      if (!response.ok) throw new Error('Failed to save card');
      return true;
    } catch (err) {
      console.error('[Trello MD Editor] Error saving description:', err);
      return false;
    }
  }

  // Create the markdown textarea editor
  function createMarkdownEditor(markdown, onSave, onCancel) {
    const container = document.createElement('div');
    container.className = 'trello-md-editor-container';
    container.setAttribute(REPLACED_ATTR, 'true');

    const textarea = document.createElement('textarea');
    textarea.className = 'trello-md-editor-textarea';
    textarea.value = markdown;
    textarea.placeholder = 'Enter description in Markdown...';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'trello-md-editor-buttons';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'trello-md-editor-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => onSave(textarea.value));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'trello-md-editor-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', onCancel);

    const hint = document.createElement('div');
    hint.className = 'trello-md-editor-hint';
    hint.textContent = 'Plain Markdown Editor (extension)';

    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(hint);

    container.appendChild(textarea);
    container.appendChild(buttonContainer);

    // Focus textarea after insertion
    setTimeout(() => textarea.focus(), 50);

    return container;
  }

  // Find and replace the description editor
  async function replaceDescriptionEditor() {
    // Check if already replaced
    if (document.querySelector(`[${REPLACED_ATTR}]`)) {
      return;
    }

    // Find the ProseMirror editor (the description editor uses this)
    const proseMirror = document.querySelector('.ProseMirror');
    if (!proseMirror) {
      return;
    }

    // Find the editor wrapper (akEditor class contains the whole editor including toolbar)
    const akEditor = proseMirror.closest('.akEditor');
    if (!akEditor) {
      return;
    }

    // Find the container that has both the toolbar and content
    const editorContainer = akEditor.parentElement;
    if (!editorContainer) {
      return;
    }

    // Find the main element to locate save/cancel buttons
    const mainElement = proseMirror.closest('main');

    const shortLink = getCardShortLink();
    if (!shortLink) {
      console.error('[Trello MD Editor] Could not determine card ID');
      return;
    }

    // Fetch current markdown
    const markdown = await fetchCardDescription(shortLink);
    if (markdown === null) {
      return;
    }

    // Find the save/discard buttons container
    const allButtons = mainElement ? mainElement.querySelectorAll('button') : document.querySelectorAll('button');
    let saveBtn = null;
    for (const btn of allButtons) {
      const text = btn.textContent.trim();
      if (text === 'Save') saveBtn = btn;
    }
    const originalButtonContainer = saveBtn?.closest('div');

    // Find toolbar
    const toolbar = document.querySelector('[data-testid="ak-editor-main-toolbar"]');

    // Hide original editor components
    if (toolbar) toolbar.style.display = 'none';
    akEditor.style.display = 'none';
    if (originalButtonContainer) originalButtonContainer.style.display = 'none';

    // Create and insert markdown editor
    const mdEditor = createMarkdownEditor(
      markdown,
      async (newMarkdown) => {
        const success = await saveCardDescription(shortLink, newMarkdown);
        if (success) {
          window.location.reload();
        } else {
          alert('Failed to save description. Please try again.');
        }
      },
      () => {
        // Cancel - restore original editor
        mdEditor.remove();
        if (toolbar) toolbar.style.display = '';
        akEditor.style.display = '';
        if (originalButtonContainer) originalButtonContainer.style.display = '';
      }
    );

    // Insert the markdown editor before the hidden akEditor
    akEditor.parentElement.insertBefore(mdEditor, akEditor);
  }

  // Observe DOM changes to detect when card dialog opens
  function observeCardDialog() {
    const observer = new MutationObserver((mutations) => {
      // Check if we're on a card page
      if (!window.location.pathname.includes('/c/')) return;

      // Look for description editor being added
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this contains a ProseMirror editor
            if (node.querySelector?.('.ProseMirror') ||
                node.classList?.contains('ProseMirror') ||
                node.querySelector?.('.akEditor')) {
              // Delay to let Trello finish rendering
              setTimeout(replaceDescriptionEditor, 150);
              return;
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check immediately in case editor is already open
    setTimeout(replaceDescriptionEditor, 500);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeCardDialog);
  } else {
    observeCardDialog();
  }

  // Also re-check on URL changes (Trello is a SPA)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(replaceDescriptionEditor, 500);
    }
  }, 500);
})();
