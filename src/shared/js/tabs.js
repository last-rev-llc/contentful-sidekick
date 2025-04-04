// Tab management for the sidebar
import { logger } from '../../core/utils/logger';

logger.debug('Loading tabs module');

// Initialize tabs and return containers
const initTabs = () => {
  logger.debug('Initializing tabs');
  const buttons = Array.from(document.querySelectorAll('.tab-button'));
  const panels = Array.from(document.querySelectorAll('.tab-content-panel'));

  logger.debug('Found tab elements', {
    buttons: buttons.map(b => b.dataset.tabId),
    panels: panels.map(p => p.id)
  });

  if (buttons.length === 0) {
    logger.error('No tab buttons found - DOM may not be loaded properly');
    return null;
  }

  const setTabVisibility = selectedTabId => {
    logger.debug('Switching tab visibility', { selectedTabId });

    // Update button classes
    buttons.forEach(button => {
      const isActive = button.dataset.tabId === selectedTabId;
      button.classList.toggle('active', isActive);
      logger.debug('Updated button state', {
        buttonId: button.dataset.tabId,
        active: isActive
      });
    });

    // Update content visibility
    panels.forEach(panel => {
      const isActive = panel.id === `tab-${selectedTabId}`;
      panel.classList.toggle('active', isActive);
      logger.debug('Updated panel state', {
        panelId: panel.id,
        active: isActive
      });
    });
  };

  // Add click handlers
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      logger.debug('Tab button clicked', { tabId: button.dataset.tabId });
      setTabVisibility(button.dataset.tabId);
    });
  });

  return {
    chatbotContainer: document.getElementById('tab-chatbot'),
    pageInfoContainer: document.getElementById('tab-pageInfo')
  };
};

// Update page info display
const updatePageInfo = info => {
  const pageInfoContainer = document.getElementById('tab-pageInfo');
  if (!pageInfoContainer) return;

  // Update URL section
  const urlContent = pageInfoContainer.querySelector('.url-content');
  if (urlContent) {
    urlContent.textContent = info.url || 'N/A';
  }

  // Update Contentful info section
  const contentfulInfo = pageInfoContainer.querySelector('.contentful-info');
  if (contentfulInfo) {
    if (info.metaTags) {
      contentfulInfo.innerHTML = `
        <div class="page-info-section">
          <h4>Contentful Space</h4>
          <div>${info.metaTags.contentfulSpace || 'N/A'}</div>
        </div>
        <div class="page-info-section">
          <h4>Contentful Environment</h4>
          <div>${info.metaTags.contentfulEnvironment || 'N/A'}</div>
        </div>
        <div class="page-info-section">
          <h4>Page ID</h4>
          <div>${info.metaTags.pageId || 'N/A'}</div>
        </div>
      `;
    } else {
      contentfulInfo.innerHTML = '';
    }

    if (info.isRestrictedUrl) {
      contentfulInfo.innerHTML += `
        <div class="page-info-error">
          This is a restricted URL. Limited information available.
        </div>
      `;
    }
  }
};

// Initialize tabs immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logger.debug('DOM Content Loaded - initializing tabs');
    window.sidekickTabs = initTabs();
  });
} else {
  logger.debug('DOM already ready - initializing tabs immediately');
  window.sidekickTabs = initTabs();
}

// Export for module usage
export { initTabs, updatePageInfo };
