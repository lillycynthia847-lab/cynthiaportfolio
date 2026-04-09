/* ==========================================
   CYNTHIA WANJIRA — Admin Dashboard Logic
   CMS: Load, Edit, Save, Export, Import
   ========================================== */

(function () {
  'use strict';

  // ===== STATE =====
  let content = null;
  let editingPortfolioId = null;
  let hasUnsavedChanges = false;

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadContent();
      initSidebar();
      initImageUploads();
      initTagsEditor();
      initPortfolioManager();
      initStatsEditor();
      initServicesEditor();
      initTopbarActions();
      initUnsavedChangesTracker();
      populateAllForms();
      showToast('✓ Content loaded', 'success');
    } catch (err) {
      console.error('Admin init error:', err);
      showToast('⚠ Failed to initialize — check console', 'error');
    }
  });

  // ===== CONTENT LOADING =====
  async function loadContent() {
    const stored = localStorage.getItem('cw_admin_content');
    if (stored) {
      try {
        content = JSON.parse(stored);
        console.log('✓ Loaded from localStorage');
        return;
      } catch (e) {
        console.warn('localStorage corrupted, clearing...', e);
        localStorage.removeItem('cw_admin_content');
      }
    }

    try {
      const response = await fetch('content.json');
      if (response.ok) {
        content = await response.json();
        console.log('✓ Loaded from content.json');
        return;
      }
    } catch (e) {
      console.warn('content.json not available:', e.message);
    }

    console.log('Using empty defaults');
    content = getEmptyDefaults();
  }

  function getEmptyDefaults() {
    return {
      hero: { greeting: '', title: '', description: '', image: '', cta1Text: '', cta1Link: '', cta2Text: '', cta2Link: '' },
      about: { title: '', bio: ['', ''], tags: [], image: '' },
      portfolio: [],
      stats: [
        { icon: '👁️', target: 0, suffix: '', label: 'TikTok Views' },
        { icon: '🎬', target: 0, suffix: '', label: 'TikTok Followers' },
        { icon: '🤝', target: 0, suffix: '+', label: 'Brand Partnerships' },
        { icon: '🏁', target: 0, suffix: '+', label: 'Events Covered' }
      ],
      services: [
        { icon: '🎬', title: 'UGC Creation', description: '', features: [], ctaText: 'Get Started →', ctaLink: '#contact' },
        { icon: '🎤', title: 'Event Hosting', description: '', features: [], ctaText: 'Book Me →', ctaLink: '#contact' }
      ],
      contact: { email: '', tiktok: '', tiktokUrl: '', instagram: '', instagramUrl: '', introText: '' }
    };
  }

  function saveContent() {
    try {
      const json = JSON.stringify(content);
      // Check localStorage capacity (~5MB limit)
      const sizeKB = (json.length * 2) / 1024;
      if (sizeKB > 4500) {
        showToast('⚠ Content too large! Reduce image sizes.', 'error');
        return false;
      }
      localStorage.setItem('cw_admin_content', json);
      hasUnsavedChanges = false;
      updateSaveIndicator();
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        showToast('⚠ Storage full! Export your content and reduce image sizes.', 'error');
      } else {
        showToast('⚠ Save failed: ' + e.message, 'error');
      }
      console.error('Save error:', e);
      return false;
    }
  }

  // ===== UNSAVED CHANGES TRACKER =====
  function initUnsavedChangesTracker() {
    // Track changes on all form inputs
    document.addEventListener('input', (e) => {
      if (e.target.closest('.admin-main')) {
        hasUnsavedChanges = true;
        updateSaveIndicator();
      }
    });

    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    });
  }

  function updateSaveIndicator() {
    const saveBtn = document.getElementById('btn-save');
    if (!saveBtn) return;
    if (hasUnsavedChanges) {
      saveBtn.innerHTML = '💾 Save <span class="unsaved-dot">●</span>';
    } else {
      saveBtn.innerHTML = '💾 Save';
    }
  }

  // ===== SIDEBAR NAVIGATION =====
  function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const panelId = link.getAttribute('data-panel');

        // Auto-collect current form data before switching panels
        try { collectAllData(); } catch (err) { /* ignore */ }

        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('panel-' + panelId);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ===== POPULATE ALL FORMS =====
  function populateAllForms() {
    try {
      populateHero();
      populateAbout();
      populatePortfolioList();
      populateStats();
      populateServices();
      populateContact();
    } catch (err) {
      console.error('Form population error:', err);
      showToast('⚠ Error loading some fields', 'error');
    }
  }

  // --- Hero ---
  function populateHero() {
    const h = content.hero || {};
    setVal('hero-greeting', h.greeting);
    setVal('hero-title', h.title);
    setVal('hero-description', h.description);
    setVal('hero-cta1-text', h.cta1Text);
    setVal('hero-cta1-link', h.cta1Link);
    setVal('hero-cta2-text', h.cta2Text);
    setVal('hero-cta2-link', h.cta2Link);
    setImagePreview('hero-image-preview', h.image);
  }

  function collectHero() {
    content.hero = {
      greeting: getVal('hero-greeting'),
      title: getVal('hero-title'),
      description: getVal('hero-description'),
      image: getImageSrc('hero-image-preview') || content.hero.image,
      cta1Text: getVal('hero-cta1-text'),
      cta1Link: getVal('hero-cta1-link'),
      cta2Text: getVal('hero-cta2-text'),
      cta2Link: getVal('hero-cta2-link')
    };
  }

  // --- About ---
  function populateAbout() {
    const a = content.about || {};
    setVal('about-title', a.title);
    setVal('about-bio-1', a.bio?.[0] || '');
    setVal('about-bio-2', a.bio?.[1] || '');
    setImagePreview('about-image-preview', a.image);
    renderAboutTags();
  }

  function collectAbout() {
    content.about = {
      title: getVal('about-title'),
      bio: [getVal('about-bio-1'), getVal('about-bio-2')].filter(b => b),
      tags: content.about.tags || [],
      image: getImageSrc('about-image-preview') || content.about.image
    };
  }

  function renderAboutTags() {
    const list = document.getElementById('about-tags-list');
    if (!list) return;
    list.innerHTML = (content.about.tags || []).map((tag, i) =>
      `<span class="tag-pill">${tag}<button class="tag-remove" data-index="${i}">✕</button></span>`
    ).join('');

    list.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        content.about.tags.splice(idx, 1);
        renderAboutTags();
        hasUnsavedChanges = true;
        updateSaveIndicator();
      });
    });
  }

  function initTagsEditor() {
    const addBtn = document.getElementById('about-tag-add');
    const input = document.getElementById('about-tag-input');
    if (!addBtn || !input) return;

    function addTag() {
      const val = input.value.trim();
      if (val) {
        if (!content.about.tags) content.about.tags = [];
        content.about.tags.push(val);
        input.value = '';
        renderAboutTags();
        hasUnsavedChanges = true;
        updateSaveIndicator();
      }
    }

    addBtn.addEventListener('click', addTag);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addTag(); }
    });
  }

  // --- Portfolio ---
  function populatePortfolioList() {
    const list = document.getElementById('portfolio-items-list');
    if (!list) return;

    if (!content.portfolio || content.portfolio.length === 0) {
      list.innerHTML = '<p style="color: var(--clr-grey); font-size: 0.85rem; padding: 1rem;">No portfolio items yet. Click "+ Add New Item" to create one.</p>';
      return;
    }

    list.innerHTML = content.portfolio.map(item => `
      <div class="portfolio-item-card" data-id="${item.id}">
        <img class="portfolio-item-thumb" src="${item.image}" alt="${item.title}" onerror="this.style.background='var(--clr-surface)'; this.alt='No image'">
        <div class="portfolio-item-info">
          <div class="portfolio-item-name">${escapeHtml(item.title)}</div>
          <div class="portfolio-item-meta"><span>${escapeHtml(item.type)}</span> · ${item.mediaType} · ${escapeHtml(item.description)}</div>
        </div>
        <div class="portfolio-item-actions">
          <button class="btn-small btn-ghost portfolio-edit-btn" data-id="${item.id}">✏️ Edit</button>
          <button class="btn-small btn-danger portfolio-delete-btn" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.portfolio-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openPortfolioModal(parseInt(btn.getAttribute('data-id'))));
    });

    list.querySelectorAll('.portfolio-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (confirm('Delete this portfolio item?')) {
          content.portfolio = content.portfolio.filter(p => p.id !== id);
          populatePortfolioList();
          hasUnsavedChanges = true;
          updateSaveIndicator();
        }
      });
    });
  }

  function initPortfolioManager() {
    const addBtn = document.getElementById('portfolio-add-btn');
    const modal = document.getElementById('portfolio-modal');
    const closeBtn = document.getElementById('portfolio-modal-close');
    const cancelBtn = document.getElementById('portfolio-modal-cancel');
    const saveBtn = document.getElementById('portfolio-modal-save');

    if (addBtn) addBtn.addEventListener('click', () => openPortfolioModal(null));
    if (closeBtn) closeBtn.addEventListener('click', closePortfolioModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closePortfolioModal);
    if (saveBtn) saveBtn.addEventListener('click', savePortfolioItem);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closePortfolioModal();
      });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePortfolioModal();
    });
  }

  function openPortfolioModal(id) {
    const modal = document.getElementById('portfolio-modal');
    const title = document.getElementById('portfolio-modal-title');

    if (id !== null) {
      editingPortfolioId = id;
      title.textContent = 'Edit Portfolio Item';
      const item = content.portfolio.find(p => p.id === id);
      if (item) {
        setVal('portfolio-item-title', item.title);
        setVal('portfolio-item-category', item.category);
        setVal('portfolio-item-type', item.type);
        setVal('portfolio-item-media-type', item.mediaType);
        setVal('portfolio-item-desc', item.description);
        setImagePreview('portfolio-item-preview', item.image);
      }
    } else {
      editingPortfolioId = null;
      title.textContent = 'Add Portfolio Item';
      setVal('portfolio-item-title', '');
      setVal('portfolio-item-category', 'race');
      setVal('portfolio-item-type', '');
      setVal('portfolio-item-media-type', 'image');
      setVal('portfolio-item-desc', '');
      clearImagePreview('portfolio-item-preview');
    }

    modal.classList.add('active');
  }

  function closePortfolioModal() {
    const modal = document.getElementById('portfolio-modal');
    if (modal) modal.classList.remove('active');
    editingPortfolioId = null;
  }

  function savePortfolioItem() {
    const title = getVal('portfolio-item-title');
    const category = getVal('portfolio-item-category');
    const type = getVal('portfolio-item-type') || category;
    const mediaType = getVal('portfolio-item-media-type');
    const description = getVal('portfolio-item-desc');
    const image = getImageSrc('portfolio-item-preview');

    if (!title) {
      showToast('Please enter a title', 'error');
      return;
    }

    if (editingPortfolioId !== null) {
      const item = content.portfolio.find(p => p.id === editingPortfolioId);
      if (item) {
        item.title = title;
        item.category = category;
        item.type = type;
        item.mediaType = mediaType;
        item.description = description;
        if (image) item.image = image;
      }
      showToast('Portfolio item updated ✓', 'success');
    } else {
      const maxId = content.portfolio.reduce((max, p) => Math.max(max, p.id || 0), 0);
      content.portfolio.push({ id: maxId + 1, category, type, title, description, image: image || '', mediaType });
      showToast('Portfolio item added ✓', 'success');
    }

    hasUnsavedChanges = true;
    updateSaveIndicator();
    populatePortfolioList();
    closePortfolioModal();
  }

  // --- Stats ---
  function populateStats() {
    const container = document.getElementById('stats-form');
    if (!container || !content.stats) return;

    container.innerHTML = content.stats.map((stat, i) => `
      <div class="stat-edit-row">
        <div class="form-group">
          <label class="form-label">Icon</label>
          <input type="text" class="form-input" id="stat-icon-${i}" value="${stat.icon}" style="text-align:center; font-size:1.3rem;">
        </div>
        <div class="form-group">
          <label class="form-label">Label</label>
          <input type="text" class="form-input" id="stat-label-${i}" value="${escapeAttr(stat.label)}">
        </div>
        <div class="form-group">
          <label class="form-label">Number</label>
          <input type="number" class="form-input" id="stat-target-${i}" value="${stat.target}" min="0">
        </div>
        <div class="form-group">
          <label class="form-label">Suffix</label>
          <input type="text" class="form-input" id="stat-suffix-${i}" value="${escapeAttr(stat.suffix)}" placeholder="+, K, M">
        </div>
      </div>
    `).join('');
  }

  function initStatsEditor() { }

  function collectStats() {
    if (!content.stats) return;
    content.stats = content.stats.map((stat, i) => ({
      icon: getVal(`stat-icon-${i}`) || stat.icon,
      label: getVal(`stat-label-${i}`) || stat.label,
      target: parseInt(getVal(`stat-target-${i}`)) || 0,
      suffix: document.getElementById(`stat-suffix-${i}`)?.value ?? stat.suffix
    }));
  }

  // --- Services ---
  function populateServices() {
    const container = document.getElementById('services-cards-container');
    if (!container || !content.services) return;

    container.innerHTML = content.services.map((svc, i) => `
      <div class="service-edit-card">
        <div class="service-edit-title">${svc.icon} Service ${i + 1}: ${escapeHtml(svc.title) || 'Untitled'}</div>
        <div class="form-row form-row-2col">
          <div class="form-group">
            <label class="form-label">Icon (Emoji)</label>
            <input type="text" class="form-input" id="svc-icon-${i}" value="${svc.icon}" style="font-size:1.3rem;">
          </div>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="svc-title-${i}" value="${escapeAttr(svc.title)}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="svc-desc-${i}" rows="3">${escapeHtml(svc.description)}</textarea>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Features</label>
            <div class="features-editor" id="svc-features-${i}">
              ${(svc.features || []).map((f, fi) => `
                <div class="feature-row">
                  <input type="text" class="form-input" data-svc="${i}" data-feature="${fi}" value="${escapeAttr(f)}">
                  <button class="feature-remove" data-svc="${i}" data-feature="${fi}">✕</button>
                </div>
              `).join('')}
            </div>
            <button class="btn-small btn-ghost" style="margin-top:0.5rem" onclick="window.adminAddFeature(${i})">+ Add Feature</button>
          </div>
        </div>
        <div class="form-row form-row-2col">
          <div class="form-group">
            <label class="form-label">CTA Button Text</label>
            <input type="text" class="form-input" id="svc-cta-text-${i}" value="${escapeAttr(svc.ctaText)}">
          </div>
          <div class="form-group">
            <label class="form-label">CTA Button Link</label>
            <input type="text" class="form-input" id="svc-cta-link-${i}" value="${escapeAttr(svc.ctaLink)}">
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.feature-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const si = parseInt(btn.getAttribute('data-svc'));
        const fi = parseInt(btn.getAttribute('data-feature'));
        content.services[si].features.splice(fi, 1);
        populateServices();
        hasUnsavedChanges = true;
        updateSaveIndicator();
      });
    });
  }

  window.adminAddFeature = function (serviceIndex) {
    collectServices();
    if (!content.services[serviceIndex].features) content.services[serviceIndex].features = [];
    content.services[serviceIndex].features.push('');
    populateServices();
    const container = document.getElementById(`svc-features-${serviceIndex}`);
    const inputs = container?.querySelectorAll('.form-input');
    if (inputs && inputs.length > 0) inputs[inputs.length - 1].focus();
    hasUnsavedChanges = true;
    updateSaveIndicator();
  };

  function collectServices() {
    if (!content.services) return;
    content.services = content.services.map((svc, i) => {
      const featureInputs = document.querySelectorAll(`input[data-svc="${i}"][data-feature]`);
      const features = [];
      featureInputs.forEach(input => {
        if (input.value.trim()) features.push(input.value.trim());
      });
      return {
        icon: getVal(`svc-icon-${i}`) || svc.icon,
        title: getVal(`svc-title-${i}`) || svc.title,
        description: getVal(`svc-desc-${i}`) || svc.description,
        features: features.length > 0 ? features : svc.features,
        ctaText: getVal(`svc-cta-text-${i}`) || svc.ctaText,
        ctaLink: getVal(`svc-cta-link-${i}`) || svc.ctaLink
      };
    });
  }

  function initServicesEditor() { }

  // --- Contact ---
  function populateContact() {
    const c = content.contact || {};
    setVal('contact-email', c.email);
    setVal('contact-tiktok', c.tiktok);
    setVal('contact-tiktok-url', c.tiktokUrl);
    setVal('contact-instagram', c.instagram);
    setVal('contact-instagram-url', c.instagramUrl);
    setVal('contact-intro', c.introText);
  }

  function collectContact() {
    content.contact = {
      email: getVal('contact-email'),
      tiktok: getVal('contact-tiktok'),
      tiktokUrl: getVal('contact-tiktok-url'),
      instagram: getVal('contact-instagram'),
      instagramUrl: getVal('contact-instagram-url'),
      introText: getVal('contact-intro')
    };
  }

  // ===== IMAGE UPLOADS =====
  function initImageUploads() {
    setupImageUpload('hero-image-input', 'hero-image-preview');
    setupImageUpload('about-image-input', 'about-image-preview');
    setupImageUpload('portfolio-item-input', 'portfolio-item-preview');
  }

  function setupImageUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast('⚠ File too large (max 10MB)', 'error');
        return;
      }

      showToast('📷 Processing image...', 'info');

      compressImage(file, 800, 0.8, (dataUrl) => {
        preview.src = dataUrl;
        preview.classList.add('has-image');
        hasUnsavedChanges = true;
        updateSaveIndicator();
        showToast('Image uploaded ✓', 'success');
      });
    });
  }

  function compressImage(file, maxSize, quality, callback) {
    const reader = new FileReader();
    reader.onerror = () => {
      showToast('⚠ Failed to read file', 'error');
    };
    reader.onload = (e) => {
      if (file.type.startsWith('video/')) {
        callback(e.target.result);
        return;
      }

      const img = new Image();
      img.onerror = () => {
        showToast('⚠ Invalid image file', 'error');
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ===== TOP BAR ACTIONS =====
  function initTopbarActions() {
    // === SAVE ===
    document.getElementById('btn-save').addEventListener('click', () => {
      collectAllData();
      const success = saveContent();
      if (success) {
        showStatusOverlay('saved');
      }
    });

    // === EXPORT ===
    document.getElementById('btn-export').addEventListener('click', () => {
      collectAllData();
      try {
        const json = JSON.stringify(content, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatusOverlay('exported');
      } catch (err) {
        console.error('Export error:', err);
        showToast('⚠ Export failed: ' + err.message, 'error');
      }
    });

    // === IMPORT ===
    const importBtn = document.getElementById('btn-import');
    const importFile = document.getElementById('import-file');
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.name.endsWith('.json')) {
        showToast('⚠ Please select a .json file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          // Validate structure
          if (!imported.hero && !imported.about && !imported.portfolio) {
            showToast('⚠ Invalid content.json structure', 'error');
            return;
          }
          content = imported;
          populateAllForms();
          saveContent();
          showStatusOverlay('imported');
        } catch (err) {
          showToast('⚠ Invalid JSON: ' + err.message, 'error');
        }
      };
      reader.onerror = () => showToast('⚠ Failed to read file', 'error');
      reader.readAsText(file);
      importFile.value = '';
    });

    // === PREVIEW ===
    document.getElementById('btn-preview').addEventListener('click', () => {
      collectAllData();
      const success = saveContent();
      if (success) {
        showToast('Opening preview...', 'info');
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = 'index.html';
          link.target = '_blank';
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 300);
      }
    });

    // === KEYBOARD SHORTCUTS ===
    document.addEventListener('keydown', (e) => {
      // Ctrl+S / Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('btn-save').click();
      }
    });
  }

  function collectAllData() {
    collectHero();
    collectAbout();
    collectStats();
    collectServices();
    collectContact();
  }

  // ===== STATUS OVERLAY (Big visual feedback) =====
  function showStatusOverlay(type) {
    // Remove any existing overlay
    const existing = document.getElementById('status-overlay');
    if (existing) existing.remove();

    const configs = {
      saved: {
        icon: '✓',
        title: 'Saved!',
        subtitle: 'All changes saved to your browser.',
        color: '#4ADE80'
      },
      exported: {
        icon: '📤',
        title: 'Exported!',
        subtitle: 'content.json downloaded. Upload it to GitHub to go live!',
        color: '#E8A0BF'
      },
      imported: {
        icon: '📥',
        title: 'Imported!',
        subtitle: 'Content loaded and saved successfully.',
        color: '#60A5FA'
      }
    };

    const cfg = configs[type];
    if (!cfg) return;

    const overlay = document.createElement('div');
    overlay.id = 'status-overlay';
    overlay.innerHTML = `
      <div class="status-overlay-backdrop"></div>
      <div class="status-overlay-card">
        <div class="status-overlay-icon" style="background: ${cfg.color}20; color: ${cfg.color};">${cfg.icon}</div>
        <h3 class="status-overlay-title">${cfg.title}</h3>
        <p class="status-overlay-subtitle">${cfg.subtitle}</p>
        <button class="status-overlay-btn" style="background: ${cfg.color}; color: #0D0D0D;">Got it</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Close handlers
    const close = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('.status-overlay-btn').addEventListener('click', close);
    overlay.querySelector('.status-overlay-backdrop').addEventListener('click', close);

    // Auto-close after 4 seconds
    setTimeout(close, 4000);
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(message, type) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    const icon = toast?.querySelector('.toast-icon');
    if (!toast || !text) return;

    text.textContent = message;

    // Set icon and color based on type
    if (icon) {
      toast.className = 'toast'; // Reset classes
      switch (type) {
        case 'success':
          icon.textContent = '✓';
          toast.classList.add('toast-success');
          break;
        case 'error':
          icon.textContent = '✕';
          toast.classList.add('toast-error');
          break;
        case 'info':
          icon.textContent = 'ℹ';
          toast.classList.add('toast-info');
          break;
        default:
          icon.textContent = '✓';
          toast.classList.add('toast-success');
      }
    }

    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // ===== HELPERS =====
  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setImagePreview(previewId, src) {
    const el = document.getElementById(previewId);
    if (el && src) {
      el.src = src;
      el.classList.add('has-image');
    }
  }

  function getImageSrc(previewId) {
    const el = document.getElementById(previewId);
    if (el && el.classList.contains('has-image')) return el.src;
    return '';
  }

  function clearImagePreview(previewId) {
    const el = document.getElementById(previewId);
    if (el) { el.src = ''; el.classList.remove('has-image'); }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

})();
