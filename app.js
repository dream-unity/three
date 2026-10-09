(() => {
  'use strict';

  const worlds = {
    garden: { name: 'The Infinite Garden', category: 'Wonder', image: 'assets/world-threshold.webp', mood: 'Awe · Discovery · Open skies', activity: 'Wander & wonder', description: 'Follow a path through the clouds, cross impossible bridges, and find a garden suspended between worlds. A place imagined for the discoveries that are better with someone beside you.', invitation: 'Meet at the great arch. Choose a distant island together, then follow wherever your curiosity leads.' },
    observatory: { name: 'The Astral Observatory', category: 'Wonder', image: 'assets/world-observatory.webp', mood: 'Stargazing · Conversation · Stillness', activity: 'Under the same stars', description: 'An observatory beyond the edge of the familiar. Great celestial rings frame an endless sky, and every terrace offers a new perspective on the universe.', invitation: 'Find a quiet terrace together. Trade questions, trace constellations, and imagine what lies beyond the horizon.' },
    forest: { name: 'The Whispering Wilds', category: 'Nature', image: 'assets/world-wilds.webp', mood: 'Forest paths · Waterfalls · Discovery', activity: 'Take the long way', description: 'Enter a vast botanical world of ancient trees, hanging walkways, and waterfalls disappearing into mist. Slow down, choose an unfamiliar path, and see what you notice together.', invitation: 'Start at the forest bridge. Take turns choosing the next path and make room for unexpected discoveries.' },
    tides: { name: 'The Tidal Sanctuary', category: 'Nature', image: 'assets/world-wilds.webp', mood: 'Water · Reflection · Quiet company', activity: 'A quieter kind of gathering', description: 'A waterside sanctuary imagined for unhurried visits. Follow the sound of falling water into secluded terraces where being together does not have to mean saying anything.', invitation: 'Choose a place by the water. Bring a friend, take a breath, and let the conversation find its own pace.' },
    resonance: { name: 'The Resonance Hall', category: 'Music', image: 'assets/world-observatory.webp', mood: 'Listening · Music · Shared atmosphere', activity: 'A listening circle', description: 'Imagine music as a place you can inhabit. An atmospheric celestial hall for shared listening, performances, and encounters shaped by sound.', invitation: 'Choose a piece of music to bring to your future visit. Share what you hear, and what it makes you imagine.' },
    cinema: { name: "The Storykeepers’ Theatre", category: 'Stories', image: 'assets/world-threshold.webp', mood: 'Cinema · Storytelling · Imagination', activity: 'A shared story', description: 'A theatre at the threshold of another world. An imagined meeting place for watching films together, sharing stories, and discovering the worlds behind them.', invitation: 'Bring a story worth sharing. Imagine stepping beyond its final frame and exploring what happens next together.' }
  };
  const ids = Object.keys(worlds);
  const hasWorld = id => typeof id === 'string' && Object.hasOwn(worlds, id);
  const storageKey = 'dream-universe-explorer-v1';
  const uniqueIds = value => Array.isArray(value) ? [...new Set(value.filter(hasWorld))].slice(0, ids.length) : [];
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { /* A private or restricted browser can still explore. */ }
  let saved = new Set(uniqueIds(stored.saved));
  let route = uniqueIds(stored.route);
  let category = 'all';
  let view = 'discover';
  let query = '';
  let toastTimer;
  let returnFocus = null;
  let previousHash = '#discover';
  const byId = id => document.getElementById(id);
  const worldDialog = byId('world-dialog');
  const journeyDialog = byId('journey-dialog');
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const announcement = message => {
    const toast = byId('toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    const activeDialog = worldDialog.open ? worldDialog : journeyDialog.open ? journeyDialog : null;
    const status = activeDialog?.querySelector('.dialog-status');
    if (status) status.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4500);
  };
  const persist = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ saved: [...saved], route })); return true; }
    catch { announcement('Browser storage is unavailable. Your choices will last for this visit.'); return false; }
  };
  const cardMatches = id => {
    const world = worlds[id];
    return world && (category === 'all' || world.category === category) && `${world.name} ${world.category} ${world.mood} ${world.description}`.toLowerCase().includes(query);
  };
  const updateSaveButtons = () => {
    document.querySelectorAll('[data-save]').forEach(button => {
      const id = button.dataset.save;
      if (!hasWorld(id)) return;
      const active = saved.has(id);
      button.classList.toggle('is-saved', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Unsave' : 'Save'} ${worlds[id].name}`);
      const label = button.querySelector('[data-save-label]');
      if (label) label.textContent = active ? 'Saved world' : 'Save world';
    });
    byId('saved-count').textContent = String(saved.size);
  };
  const renderSaved = () => {
    const grid = byId('saved-grid');
    grid.replaceChildren();
    saved.forEach(id => {
      const original = document.querySelector(`#world-grid .world-card[data-world="${id}"]`);
      if (!original) return;
      const card = original.cloneNode(true);
      card.hidden = false;
      card.removeAttribute('id');
      card.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      grid.append(card);
    });
    byId('saved-empty').hidden = saved.size > 0;
    updateSaveButtons();
  };
  const renderRoute = () => {
    const list = byId('route-list');
    list.replaceChildren();
    if (!route.length) {
      const empty = document.createElement('li');
      empty.className = 'route-empty';
      empty.textContent = 'Your next journey starts with a world. Add a destination and invite someone along.';
      list.append(empty);
      return;
    }
    route.forEach((id, index) => {
      const item = document.createElement('li');
      item.className = 'route-stop';
      item.innerHTML = `<img src="${worlds[id].image}" alt="" width="44" height="44"><div class="route-stop-copy"><span>Destination ${index + 1}</span><strong>${escape(worlds[id].name)}</strong></div><button class="route-remove" data-remove-route="${id}" aria-label="Remove ${escape(worlds[id].name)} from journey">×</button>`;
      list.append(item);
    });
  };
  const applyFilters = () => {
    let count = 0;
    document.querySelectorAll('#world-grid .world-card').forEach(card => {
      const matches = cardMatches(card.dataset.world);
      card.hidden = !matches;
      if (matches) count++;
    });
    byId('no-results').hidden = count > 0;
    byId('search-status').textContent = `${count} world ${count === 1 ? 'concept' : 'concepts'}${query ? ' matching your search' : ''}`;
    document.querySelectorAll('[data-category-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category)));
  };
  const setView = (next, updateHash = true, scroll = true) => {
    view = ['saved', 'together'].includes(next) ? next : 'discover';
    byId('discover-view').hidden = view === 'saved';
    byId('saved-view').hidden = view !== 'saved';
    document.querySelectorAll('[data-view]').forEach(button => {
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    if (updateHash && location.hash !== `#${view}`) history.pushState(null, '', `#${view}`);
    if (scroll) {
      const target = view === 'together' ? byId('together') : view === 'saved' ? byId('saved-view') : byId('discover-view');
      target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  };
  const closeDialogs = (restoreHash = true) => {
    if (worldDialog.open) worldDialog.close();
    if (journeyDialog.open) journeyDialog.close();
    if (restoreHash && /^#(?:world|journey)=/.test(location.hash)) {
      if (history.state?.dreamModal) history.back();
      else history.replaceState(null, '', previousHash);
    }
  };
  const openDialog = (dialog, hash, updateHash) => {
    const wasOpen = worldDialog.open || journeyDialog.open;
    if (!wasOpen) {
      returnFocus = document.activeElement;
      previousHash = /^#(?:discover|together|saved)$/.test(location.hash) ? location.hash : `#${view}`;
    }
    closeDialogs(false);
    if (updateHash) history[wasOpen ? 'replaceState' : 'pushState']({ dreamModal: true }, '', hash);
    dialog.showModal();
  };
  const preview = (id, updateHash = true) => {
    const world = worlds[id];
    if (!hasWorld(id)) return;
    byId('world-dialog-body').innerHTML = `<div class="world-preview-image"><img id="preview-scene" src="${world.image}" alt="${escape(world.name)} — an imagined shared virtual world" width="1672" height="941"></div><div class="preview-controls"><span>Scene preview</span><label for="scene-pan">Look across the world</label><input id="scene-pan" type="range" min="0" max="100" value="50" aria-label="Pan across the world artwork"></div><div class="world-detail-content"><p class="modal-eyebrow">${escape(world.category)} · World concept</p><h2 class="modal-title" id="world-modal-title">${escape(world.name)}</h2><p class="modal-description">${escape(world.description)}</p><p class="detail-tags">${escape(world.mood)}</p><div class="together-prompt"><span class="modal-eyebrow">Better, together</span><p>${escape(world.invitation)}</p></div><div class="detail-actions"><button class="button primary-button" data-plan="${id}">Plan a shared visit <span aria-hidden="true">↗</span></button><button class="button secondary-button" data-save="${id}"><span data-save-label>Save world</span></button></div><p class="preview-note">Explore this concept artwork and plan a journey. Multiplayer sessions and headset entry are not available yet.</p><p class="dialog-status" role="status" aria-live="polite"></p></div>`;
    worldDialog.setAttribute('aria-labelledby', 'world-modal-title');
    openDialog(worldDialog, `#world=${id}`, updateHash);
    updateSaveButtons();
  };
  const journeyUrl = () => {
    const url = new URL(location.href);
    url.search = '';
    url.hash = `journey=${route.join(',')}`;
    return url.href;
  };
  const updateJourney = () => {
    document.querySelectorAll('[data-route-choice]').forEach(input => { input.checked = route.includes(input.dataset.routeChoice); });
    const selected = byId('journey-selected');
    if (selected) selected.textContent = route.length ? route.map(id => worlds[id].name).join(' → ') : 'Choose at least one destination to create an invitation.';
    const shareInput = byId('share-url');
    if (shareInput) shareInput.value = route.length ? journeyUrl() : '';
    const copy = byId('copy-invitation');
    if (copy) copy.disabled = route.length === 0;
    const first = byId('preview-journey');
    if (first) { first.disabled = route.length === 0; first.dataset.preview = route[0] || ''; }
    renderRoute();
  };
  const plan = (id, updateHash = true, imported = false) => {
    if (hasWorld(id) && !route.includes(id)) { route.push(id); persist(); }
    byId('journey-dialog-body').innerHTML = `<div class="journey-content"><p class="modal-eyebrow">A world is better with company</p><h2 class="modal-title" id="journey-modal-title">${imported ? 'Someone imagined this journey with you.' : 'Where shall we go together?'}</h2><p class="modal-description">Choose a few worlds and share a route with your people. You can explore the same world concepts and imagine your next adventure together.</p><fieldset class="journey-fieldset"><legend>Choose your destinations</legend><div class="journey-options">${ids.map(key => `<label class="journey-option"><img src="${worlds[key].image}" alt="" width="72" height="54"><span><strong>${escape(worlds[key].name)}</strong><small>${escape(worlds[key].category)}</small></span><input type="checkbox" data-route-choice="${key}" aria-label="Include ${escape(worlds[key].name)}"></label>`).join('')}</div></fieldset><div class="journey-itinerary"><p class="modal-eyebrow">Your shared route</p><p id="journey-selected" class="journey-selected"></p></div><label class="share-label" for="share-url">Invitation link</label><div class="share-field"><input id="share-url" readonly type="text" aria-describedby="share-help"><button id="copy-invitation" class="button primary-button" data-action="copy-invitation">Copy link</button></div><p id="share-help" class="share-help">Anyone with this link can open these world previews. It shares an itinerary; it does not create a live multiplayer room.</p><div class="journey-actions"><button id="preview-journey" class="button secondary-button">Preview first destination <span aria-hidden="true">↗</span></button><button class="button text-button" data-close>Keep exploring</button></div><p class="preview-note">Your saved worlds and journey stay in this browser. No account is needed for this preview.</p><p class="dialog-status" role="status" aria-live="polite"></p></div>`;
    journeyDialog.setAttribute('aria-labelledby', 'journey-modal-title');
    openDialog(journeyDialog, `#journey=${route.join(',')}`, updateHash);
    updateJourney();
  };

  document.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-close')) { closeDialogs(); return; }
    if (hasWorld(button.dataset.preview)) { preview(button.dataset.preview); return; }
    if (hasWorld(button.dataset.plan)) { plan(button.dataset.plan); return; }
    if (button.dataset.view) { setView(button.dataset.view); return; }
    if (button.dataset.categoryFilter) { category = button.dataset.categoryFilter; applyFilters(); return; }
    if (hasWorld(button.dataset.save)) {
      const id = button.dataset.save;
      const inSavedGrid = Boolean(button.closest('#saved-grid'));
      const savedIndex = inSavedGrid ? [...byId('saved-grid').querySelectorAll('[data-save]')].indexOf(button) : -1;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      const persisted = persist();
      renderSaved();
      if (inSavedGrid) {
        const remaining = byId('saved-grid').querySelectorAll('[data-save]');
        (remaining[Math.min(savedIndex, remaining.length - 1)] || byId('saved-empty').querySelector('button') || document.querySelector('[data-view=discover]'))?.focus({ preventScroll: true });
      }
      if (persisted) announcement(saved.has(id) ? `${worlds[id].name} saved to your worlds.` : `${worlds[id].name} removed from your saved worlds.`);
      return;
    }
    if (button.dataset.removeRoute) {
      route = route.filter(id => id !== button.dataset.removeRoute);
      persist(); updateJourney();
      return;
    }
    if (button.dataset.action === 'plan') { plan(); return; }
    if (button.dataset.action === 'clear-filters') {
      query = ''; category = 'all'; byId('world-search').value = ''; applyFilters(); byId('world-search').focus(); return;
    }
    if (button.dataset.action === 'copy-invitation' && route.length) {
      const input = byId('share-url');
      try {
        await navigator.clipboard.writeText(journeyUrl());
        announcement('Invitation copied. Share it with your travelling companions.');
        button.textContent = 'Copied';
      } catch {
        input.focus(); input.select();
        announcement('Select and copy the invitation link to share your journey.');
      }
    }
  });
  document.addEventListener('change', event => {
    const id = event.target.dataset.routeChoice;
    if (!hasWorld(id)) return;
    if (event.target.checked && !route.includes(id)) route.push(id);
    else if (!event.target.checked) route = route.filter(item => item !== id);
    persist(); updateJourney();
    history.replaceState(history.state, '', `#journey=${route.join(',')}`);
    const copy = byId('copy-invitation');
    if (copy) copy.textContent = 'Copy link';
  });
  document.addEventListener('input', event => {
    if (event.target.id === 'scene-pan') byId('preview-scene').style.transform = `translateX(${(50 - Number(event.target.value)) * 0.259}%)`;
  });
  byId('world-search').addEventListener('input', event => {
    query = event.target.value.trim().toLowerCase();
    if (view !== 'discover') setView('discover', true, false);
    applyFilters();
  });
  [worldDialog, journeyDialog].forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialogs(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialogs();
    });
    dialog.addEventListener('close', () => {
      if (!worldDialog.open && !journeyDialog.open && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
  });
  const readHash = () => {
    const hash = location.hash;
    if (hash.startsWith('#world=')) {
      const id = hash.slice(7);
      if (hasWorld(id)) { preview(id, false); return; }
    }
    if (hash.startsWith('#journey=')) {
      route = uniqueIds(hash.slice(9).split(','));
      persist();
      plan(undefined, false, true); return;
    }
    closeDialogs(false);
    setView(hash.slice(1), false, Boolean(hash));
  };
  window.addEventListener('hashchange', readHash);
  renderSaved(); renderRoute(); applyFilters(); readHash();
})();
