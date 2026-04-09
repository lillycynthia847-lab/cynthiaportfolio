/* ==========================================
   CYNTHIA WANJIRA — Admin Dashboard Logic
   CMS: Load, Edit, Save, Export, Import
   ========================================== */

(function () {
  'use strict';

  // ===== STATE =====
  let content = null;
  let editingPortfolioId = null; // null = adding, number = editing

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    initSidebar();
    initImageUploads();
    initTagsEditor();
    initPortfolioManager();
    initStatsEditor();
    initServicesEditor();
    initTopbarActions();
    populateAllForms();
  });

  // ===== CONTENT LOADING =====
  async function loadContent() {
    // Priority: localStorage > content.json > empty defaults
    const stored = localStorage.getItem('cw_admin_content');
    if (stored) {
      try {
        content = JSON.parse(stored);
        return;
      } catch (e) { /* fall through */ }
    }

    try {
      const response = await fetch('content.json');
      if (response.ok) {
        content = await response.json();
        return;
      }
    } catch (e) { /* fall through */ }

    // Empty defaults
    content = {
      hero: { greeting: '', title: '', description: '', image: '', cta1Text: '', cta1Link: '', cta2Text: '', cta2Link: '' },
      about: { title: '', bio: ['', ''], tags: [], image: '' },
      portfolio: [],
      stats: [
        { icon: '📊', target: 0, suffix: '', label: 'Metric' },
        { icon: '📊', target: 0, suffix: '', label: 'Metric' },
        { icon: '📊', target: 0, suffix: '', label: 'Metric' },
        { icon: '📊', target: 0, suffix: '', label: 'Metric' }
      ],
      services: [
        { icon: '🎬', title: '', description: '', features: [], ctaText: '', ctaLink: '' },
        { icon: '🎤', title: '', description: '', features: [], ctaText: '', ctaLink: '' }
      ],
      contact: { email: '', tiktok: '', tiktokUrl: '', instagram: '', instagramUrl: '', introText: '' }
    };
  }

  function saveContent() {
    localStorage.setItem('cw_admin_content', JSON.stringify(content));
    showToast('Changes saved!');
  }

  // ===== SIDEBAR NAVIGATION =====
  function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const panelId = link.getAttribute('data-panel');

        // Update sidebar active state
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show chosen panel
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('panel-' + panelId);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ===== POPULATE ALL FORMS =====
  function populateAllForms() {
    populateHero();
    populateAbout();
    populatePortfolioList();
    populateStats();
    populateServices();
    populateContact();
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
      list.innerHTML = '<p style="color: var(--clr-grey); font-size: 0.85rem; padding: 1rem;">No portfolio items yet. Click "Add New Item" to create one.</p>';
      return;
    }

    list.innerHTML = content.portfolio.map(item => `
      <div class="portfolio-item-card" data-id="${item.id}">
        <img class="portfolio-item-thumb" src="${item.image}" alt="${item.title}" onerror="this.style.display='none'">
        <div class="portfolio-item-info">
          <div class="portfolio-item-name">${item.title}</div>
          <div class="portfolio-item-meta"><span>${item.type}</span> · ${item.mediaType} · ${item.description}</div>
        </div>
        <div class="portfolio-item-actions">
          <button class="btn-small btn-ghost portfolio-edit-btn" data-id="${item.id}">✏️ Edit</button>
          <button class="btn-small btn-danger portfolio-delete-btn" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    // Attach events
    list.querySelectorAll('.portfolio-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openPortfolioModal(parseInt(btn.getAttribute('data-id'))));
    });

    list.querySelectorAll('.portfolio-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        content.portfolio = content.portfolio.filter(p => p.id !== id);
        populatePortfolioList();
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

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closePortfolioModal();
      });
    }
  }

  function openPortfolioModal(id) {
    const modal = document.getElementById('portfolio-modal');
    const title = document.getElementById('portfolio-modal-title');

    if (id !== null) {
      // Edit mode
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
      // Add mode
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
    modal.classList.remove('active');
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
      showToast('Please enter a title', true);
      return;
    }

    if (editingPortfolioId !== null) {
      // Update existing
      const item = content.portfolio.find(p => p.id === editingPortfolioId);
      if (item) {
        item.title = title;
        item.category = category;
        item.type = type;
        item.mediaType = mediaType;
        item.description = description;
        if (image) item.image = image;
      }
    } else {
      // Add new
      const maxId = content.portfolio.reduce((max, p) => Math.max(max, p.id || 0), 0);
      content.portfolio.push({
        id: maxId + 1,
        category,
        type,
        title,
        description,
        image: image || '',
        mediaType
      });
    }

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
          <input type="text" class="form-input" id="stat-label-${i}" value="${stat.label}">
        </div>
        <div class="form-group">
          <label class="form-label">Number</label>
          <input type="number" class="form-input" id="stat-target-${i}" value="${stat.target}">
        </div>
        <div class="form-group">
          <label class="form-label">Suffix</label>
          <input type="text" class="form-input" id="stat-suffix-${i}" value="${stat.suffix}" placeholder="+, K, M">
        </div>
      </div>
    `).join('');
  }

  function initStatsEditor() {
    // Stats are collected on save
  }

  function collectStats() {
    if (!content.stats) return;
    content.stats = content.stats.map((stat, i) => ({
      icon: getVal(`stat-icon-${i}`) || stat.icon,
      label: getVal(`stat-label-${i}`) || stat.label,
      target: parseInt(getVal(`stat-target-${i}`)) || stat.target,
      suffix: getVal(`stat-suffix-${i}`)
    }));
  }

  // --- Services ---
  function populateServices() {
    const container = document.getElementById('services-cards-container');
    if (!container || !content.services) return;

    container.innerHTML = content.services.map((svc, i) => `
      <div class="service-edit-card">
        <div class="service-edit-title">${svc.icon} Service ${i + 1}: ${svc.title || 'Untitled'}</div>
        <div class="form-row form-row-2col">
          <div class="form-group">
            <label class="form-label">Icon (Emoji)</label>
            <input type="text" class="form-input" id="svc-icon-${i}" value="${svc.icon}" style="font-size:1.3rem;">
          </div>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="svc-title-${i}" value="${svc.title}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="svc-desc-${i}" rows="3">${svc.description}</textarea>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Features</label>
            <div class="features-editor" id="svc-features-${i}">
              ${(svc.features || []).map((f, fi) => `
                <div class="feature-row">
                  <input type="text" class="form-input" data-svc="${i}" data-feature="${fi}" value="${f}">
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
            <input type="text" class="form-input" id="svc-cta-text-${i}" value="${svc.ctaText}">
          </div>
          <div class="form-group">
            <label class="form-label">CTA Button Link</label>
            <input type="text" class="form-input" id="svc-cta-link-${i}" value="${svc.ctaLink}">
          </div>
        </div>
      </div>
    `).join('');

    // Attach remove events
    container.querySelectorAll('.feature-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const si = parseInt(btn.getAttribute('data-svc'));
        const fi = parseInt(btn.getAttribute('data-feature'));
        content.services[si].features.splice(fi, 1);
        populateServices();
      });
    });
  }

  // Global function for add feature button
  window.adminAddFeature = function (serviceIndex) {
    collectServices();
    if (!content.services[serviceIndex].features) content.services[serviceIndex].features = [];
    content.services[serviceIndex].features.push('');
    populateServices();
    // Focus the new input
    const container = document.getElementById(`svc-features-${serviceIndex}`);
    const inputs = container.querySelectorAll('.form-input');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  };

  function collectServices() {
    if (!content.services) return;
    content.services = content.services.map((svc, i) => {
      const featureInputs = document.querySelectorAll(`[data-svc="${i}"][data-feature]`);
      const features = [];
      featureInputs.forEach(input => {
        if (input.tagName === 'INPUT' && input.value.trim()) {
          features.push(input.value.trim());
        }
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

      // Compress and convert to base64
      compressImage(file, 800, 0.8, (dataUrl) => {
        preview.src = dataUrl;
        preview.classList.add('has-image');
      });
    });
  }

  function compressImage(file, maxSize, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // For video files, just use the data URL directly
      if (file.type.startsWith('video/')) {
        callback(e.target.result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = (h / w) * maxSize;
            w = maxSize;
          } else {
            w = (w / h) * maxSize;
            h = maxSize;
          }
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
    // Save
    document.getElementById('btn-save').addEventListener('click', () => {
      collectAllData();
      saveContent();
    });

    // Export
    document.getElementById('btn-export').addEventListener('click', () => {
      collectAllData();
      const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'content.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('content.json downloaded!');
    });

    // Import
    const importBtn = document.getElementById('btn-import');
    const importFile = document.getElementById('import-file');
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          content = JSON.parse(evt.target.result);
          populateAllForms();
          saveContent();
          showToast('Content imported successfully!');
        } catch (err) {
          showToast('Invalid JSON file', true);
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be re-imported
      importFile.value = '';
    });

    // Preview
    document.getElementById('btn-preview').addEventListener('click', () => {
      // Save before preview
      collectAllData();
      saveContent();
      window.open('index.html', '_blank');
    });
  }

  function collectAllData() {
    collectHero();
    collectAbout();
    collectStats();
    collectServices();
    collectContact();
    // Portfolio is already live-updated
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
    if (el && el.classList.contains('has-image')) {
      return el.src;
    }
    return '';
  }

  function clearImagePreview(previewId) {
    const el = document.getElementById(previewId);
    if (el) {
      el.src = '';
      el.classList.remove('has-image');
    }
  }

  function showToast(message, isError) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;

    text.textContent = message;
    toast.classList.toggle('error', !!isError);
    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), 3000);
  }

})();
