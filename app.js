(() => {
  'use strict';

  const WORLDS = [
    {
      id: 'aether', title: 'The Aether Isles', category: 'adventure', categoryLabel: 'Otherworldly adventures',
      description: 'Floating islands, impossible bridges, and a horizon worth getting lost in together.',
      detail: 'An archipelago suspended above a sea of clouds. Follow the hanging paths between weathered observatories, quiet gardens and islands that seem to drift toward the stars.',
      activities: ['Trace a route through the floating archipelago', 'Imagine the stories behind its abandoned sky temples', 'Find a cloudside overlook to share with friends'],
      atmosphere: 'Open skies · floating islands · shared discovery',
      artLabel: 'Concept illustration of floating islands and sky bridges'
    },
    {
      id: 'verdant', title: 'The Verdant Cathedral', category: 'nature', categoryLabel: 'Nature & wonder',
      description: 'An ancient forest, luminous waterways, and places to slow down with your people.',
      detail: 'A living sanctuary where enormous trees form vaulted halls above a luminous river. Follow the water beneath root bridges and into clearings shaped by light, leaves and time.',
      activities: ['Wander beneath a cathedral of ancient trees', 'Discover hidden clearings along the river', 'Dream up a quiet gathering among the roots'],
      atmosphere: 'Ancient forest · luminous rivers · quiet company',
      artLabel: 'Concept illustration of an immense forest sanctuary'
    },
    {
      id: 'observatory', title: 'The Midnight Observatory', category: 'night', categoryLabel: 'After dark',
      description: 'A moonlit amphitheatre above a dark ocean, made for stargazing and long conversations.',
      detail: 'A circular amphitheatre overlooking an endless ocean. Its sweeping stone terraces face a vast ringed moon, reflected in the still water beneath a sky full of stars.',
      activities: ['Follow the curved terraces down toward the ocean', 'Imagine a shared evening beneath the ringed moon', 'Bring a question for a conversation under the stars'],
      atmosphere: 'Ocean terraces · ringed moon · conversation',
      artLabel: 'Concept illustration of an ocean amphitheatre beneath a ringed moon'
    }
  ];
  const worldById = Object.assign(Object.create(null), Object.fromEntries(WORLDS.map(world => [world.id, world])));
  const STORAGE_SAVED = 'dream-universe.saved.v1';
  const STORAGE_PLANS = 'dream-universe.gatherings.v1';
  const grid = document.querySelector('#world-grid');
  const search = document.querySelector('#world-search');
  const worldDialog = document.querySelector('#world-dialog');
  const worldDetail = document.querySelector('#world-detail');
  const planDialog = document.querySelector('#plan-dialog');
  const planForm = document.querySelector('#plan-form');
  const planWorld = document.querySelector('#plan-world');
  const planName = document.querySelector('#plan-name');
  const planDate = document.querySelector('#plan-date');
  const planNote = document.querySelector('#plan-note');
  const planFeedback = document.querySelector('#plan-feedback');
  const gatheringList = document.querySelector('#gathering-list');
  const toast = document.querySelector('#toast');
  let activeFilter = 'all';
  let toastTimer;
  let currentWorld = null;
  const dialogOpeners = new WeakMap();

  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function readStored(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    } catch (_) {
      return [];
    }
  }

  const saved = new Set(readStored(STORAGE_SAVED).filter(id => typeof id === 'string' && worldById[id]));
  let plans = readStored(STORAGE_PLANS).slice(0, 200).filter(plan => (
    plan && typeof plan === 'object' && typeof plan.id === 'string' &&
    plan.id.length <= 100 && worldById[plan.world] && typeof plan.name === 'string' &&
    plan.name.trim() && typeof plan.date === 'string' && Number.isFinite(new Date(plan.date).getTime())
  )).map(plan => ({
    id: plan.id, world: plan.world, name: plan.name.trim().slice(0, 70), date: plan.date,
    note: typeof plan.note === 'string' ? plan.note.slice(0, 400) : '',
    timezone: typeof plan.timezone === 'string' ? plan.timezone.slice(0, 80) : ''
  }));

  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function notify(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.textContent = '';
    }, 6500);
  }

  function worldURL(id) {
    const url = new URL(window.location.href);
    url.hash = `world=${id}`;
    return url.href;
  }

  function renderWorlds() {
    if (!grid) return;
    const query = search ? search.value.trim().toLocaleLowerCase() : '';
    const matches = WORLDS.filter(world => {
      const categoryMatch = activeFilter === 'all' || (activeFilter === 'saved' ? saved.has(world.id) : activeFilter === world.category);
      const searchMatch = `${world.title} ${world.categoryLabel} ${world.description} ${world.atmosphere}`.toLocaleLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
    const previousOpener = worldDialog ? dialogOpeners.get(worldDialog) : null;
    const openerWasInGrid = previousOpener && grid.contains(previousOpener);
    grid.innerHTML = matches.map(world => `
      <article class="world-card" aria-labelledby="world-title-${world.id}">
        <button class="world-image world-${world.id}" data-open-world="${world.id}" aria-label="Explore ${world.title}">
          <span class="world-art-label">World concept</span>
          <span class="world-image-arrow" aria-hidden="true">↗</span>
        </button>
        <div class="world-body">
          <p class="world-category">${world.categoryLabel}</p>
          <h3 id="world-title-${world.id}"><button data-open-world="${world.id}">${world.title}</button></h3>
          <p class="world-description">${world.description}</p>
          <p class="world-creator">Dream Universe · Original concept</p>
          <div class="world-card-footer">
            <button class="text-link" data-open-world="${world.id}">Explore concept <span aria-hidden="true">↗</span></button>
            <button class="save-button${saved.has(world.id) ? ' is-saved' : ''}" data-save-world="${world.id}" aria-pressed="${saved.has(world.id)}" aria-label="${saved.has(world.id) ? 'Unsave' : 'Save'} ${world.title}">${saved.has(world.id) ? 'Saved' : 'Save'}</button>
          </div>
        </div>
      </article>`).join('');
    if (openerWasInGrid && worldDialog) {
      const id = previousOpener.dataset.openWorld;
      const replacement = worldById[id] ? grid.querySelector(`[data-open-world="${id}"]`) : null;
      dialogOpeners.set(worldDialog, replacement || document.querySelector('.filter-button[data-filter="all"]'));
    }
    const resultCount = document.querySelector('#result-count');
    if (resultCount) resultCount.textContent = `${matches.length} world concept${matches.length === 1 ? '' : 's'}`;
    const empty = document.querySelector('#empty-state');
    if (empty) {
      empty.hidden = matches.length > 0;
      if (!matches.length) {
        let message = empty.querySelector('p');
        if (!message) {
          message = document.createElement('p');
          empty.prepend(message);
        }
        message.textContent = activeFilter === 'saved' && !saved.size
          ? 'Your collection starts here. Save a world you would love to explore together.'
          : 'No worlds match yet. Try another search or choose All worlds.';
      }
    }
    document.querySelectorAll('.filter-button[data-filter], .chip[data-filter]').forEach(button => {
      const selected = button.dataset.filter === activeFilter;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-active', selected);
    });
    syncSavedButtons();
  }

  function syncSavedButtons() {
    const count = document.querySelector('#saved-count');
    if (count) count.textContent = String(saved.size);
    document.querySelectorAll('[data-save-world]').forEach(button => {
      const world = worldById[button.dataset.saveWorld];
      if (!world) return;
      const isSaved = saved.has(world.id);
      button.setAttribute('aria-pressed', String(isSaved));
      button.setAttribute('aria-label', `${isSaved ? 'Unsave' : 'Save'} ${world.title}`);
      button.classList.toggle('is-saved', isSaved);
      button.textContent = isSaved ? 'Saved' : 'Save';
    });
  }

  function toggleSaved(id, source) {
    if (!worldById[id]) return;
    const wasSaved = saved.has(id);
    if (wasSaved) saved.delete(id); else saved.add(id);
    const persisted = persist(STORAGE_SAVED, [...saved]);
    // Keep keyboard focus when the grid changes, including when removing a saved card.
    const wasInGrid = grid && grid.contains(source);
    renderWorlds();
    if (wasInGrid) {
      const replacement = grid.querySelector(`[data-save-world="${id}"]`);
      if (replacement) replacement.focus({ preventScroll: true });
      else document.querySelector('.filter-button[data-filter="saved"]')?.focus({ preventScroll: true });
    }
    const action = wasSaved ? `${worldById[id].title} removed from your collection.` : `${worldById[id].title} saved to your collection.`;
    notify(persisted ? action : `${action} Kept for this visit only; browser storage is unavailable.`);
  }

  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    dialogOpeners.set(dialog, opener || document.activeElement);
    dialog.showModal();
  }

  function clearWorldHash() {
    if (!window.location.hash.startsWith('#world=')) return;
    const url = new URL(window.location.href);
    url.hash = '';
    history.replaceState(null, '', url);
  }

  function openWorld(id, opener, updateHash = true) {
    const world = worldById[id];
    if (!world || !worldDialog || !worldDetail) return;
    currentWorld = id;
    worldDetail.innerHTML = `
      <div class="world-detail-art world-${id}" role="img" aria-label="${world.artLabel}"><span class="world-art-label">World concept</span></div>
      <div class="world-detail-copy">
        <p class="world-category">${world.categoryLabel}</p>
        <h2 id="world-dialog-title">${world.title}</h2>
        <p class="world-meta">${world.atmosphere}</p>
        <p>${world.detail}</p>
        <h3>A place to explore together</h3>
        <ul class="detail-activities">${world.activities.map(activity => `<li>${activity}</li>`).join('')}</ul>
        <p class="concept-note">World concept · immersive access in development. This is an illustrated destination idea. You can save it, share it, or plan a conversation around it; a playable VR world is not available yet.</p>
        <div class="world-detail-actions">
          <button class="button button-primary" data-plan-gathering data-world="${id}">Plan a gathering <span aria-hidden="true">↗</span></button>
          <button class="button button-secondary save-button" data-save-world="${id}" aria-pressed="${saved.has(id)}">${saved.has(id) ? 'Saved' : 'Save'}</button>
          <button class="text-link" data-share-world="${id}">Share world <span aria-hidden="true">↗</span></button>
        </div>
      </div>`;
    worldDialog.setAttribute('aria-labelledby', 'world-dialog-title');
    syncSavedButtons();
    if (updateHash) history.replaceState(null, '', worldURL(id));
    openDialog(worldDialog, opener);
  }

  function localDatetime(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function openPlanner(id, opener) {
    if (!planDialog || !planForm) return;
    const returnTo = worldDialog?.open ? dialogOpeners.get(worldDialog) : opener;
    if (worldDialog?.open) {
      dialogOpeners.delete(worldDialog);
      worldDialog.close();
      clearWorldHash();
    }
    planForm.reset();
    if (planWorld && worldById[id]) planWorld.value = id;
    if (planFeedback) planFeedback.textContent = '';
    if (planDate) {
      planDate.min = localDatetime(new Date(Date.now() + 60000));
      planDate.setCustomValidity('');
    }
    planName?.setCustomValidity('');
    openDialog(planDialog, returnTo);
    planName?.focus();
  }

  function formattedDate(date, timezone) {
    const options = { dateStyle: 'medium', timeStyle: 'short' };
    let zone = timezone;
    try {
      if (!zone) zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatted = new Intl.DateTimeFormat(undefined, { ...options, timeZone: zone }).format(new Date(date));
      return `${formatted} (${zone.replace(/_/g, ' ')})`;
    } catch (_) {
      return `${new Date(date).toISOString().replace('T', ' ').slice(0, 16)} (UTC)`;
    }
  }

  function renderGatherings() {
    if (!gatheringList) return;
    const count = document.querySelector('#gathering-count');
    if (count) count.textContent = String(plans.length);
    if (!plans.length) {
      gatheringList.innerHTML = '<div class="empty-gathering"><span class="empty-gathering-mark" aria-hidden="true">◎</span><p>Your next shared adventure begins with a plan.</p><span>Choose a world concept, make a gathering plan, and share it with your people.</span></div>';
      return;
    }
    gatheringList.innerHTML = [...plans].sort((a, b) => new Date(a.date) - new Date(b.date)).map(plan => {
      const world = worldById[plan.world];
      const date = formattedDate(plan.date, plan.timezone);
      const isPast = new Date(plan.date).getTime() < Date.now();
      return `<article class="gathering-card" aria-labelledby="gathering-${escape(plan.id)}">
        <div class="gathering-card-top"><p class="world-category">${isPast ? 'Past plan' : 'Your gathering plan'}</p><button class="delete-plan" data-delete-plan="${escape(plan.id)}" aria-label="Delete ${escape(plan.name)}">Remove</button></div>
        <h3 id="gathering-${escape(plan.id)}">${escape(plan.name)}</h3>
        <button class="gathering-world text-link" data-open-world="${world.id}">${world.title} <span aria-hidden="true">↗</span></button>
        <p class="gathering-date"><time datetime="${escape(plan.date)}">${escape(date)}</time></p>
        ${plan.note ? `<p class="gathering-note">${escape(plan.note)}</p>` : ''}
        <p class="concept-note">A plan to explore a world concept together. VR access is in development.</p>
        <div class="gathering-actions"><button class="text-link" data-share-plan="${escape(plan.id)}">Copy plan to share <span aria-hidden="true">↗</span></button></div>
      </article>`;
    }).join('');
  }

  async function copyText(text, container, kind) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      notify(`${kind} copied. You can share it with your people.`);
    } catch (_) {
      const target = container || gatheringList || document.body;
      target.querySelector('.share-fallback')?.remove();
      const fallback = document.createElement('div');
      fallback.className = 'share-fallback';
      const label = document.createElement('p');
      label.textContent = `Copy this ${kind.toLowerCase()} to share:`;
      const input = document.createElement('textarea');
      input.value = text;
      input.readOnly = true;
      input.rows = kind === 'World link' ? 2 : 6;
      input.setAttribute('aria-label', `${kind} to copy`);
      fallback.append(label, input);
      target.append(fallback);
      input.focus();
      input.select();
      notify('Automatic copying is unavailable. Select and copy the text shown.');
    }
  }

  function sharePlan(id, source) {
    const plan = plans.find(item => item.id === id);
    if (!plan) return;
    const text = [
      plan.name,
      `World concept: ${worldById[plan.world].title}`,
      `When: ${formattedDate(plan.date, plan.timezone)}`,
      plan.note ? `Notes: ${plan.note}` : '',
      'A plan to discuss and explore a world concept together. This is not a live VR session; immersive access is in development.',
      worldURL(plan.world)
    ].filter(Boolean).join('\n');
    copyText(text, source.closest('.gathering-card'), 'Gathering plan');
  }

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('button, a') : null;
    if (!target) return;
    if (target.matches('[data-open-world]')) {
      event.preventDefault();
      openWorld(target.dataset.openWorld, target);
    } else if (target.matches('[data-save-world]')) {
      event.preventDefault();
      toggleSaved(target.dataset.saveWorld, target);
    } else if (target.matches('[data-plan-gathering]')) {
      event.preventDefault();
      openPlanner(target.dataset.world, target);
    } else if (target.matches('[data-close-dialog]')) {
      target.closest('dialog')?.close();
    } else if (target.matches('#reset-search')) {
      if (search) search.value = '';
      activeFilter = 'all';
      renderWorlds();
      search?.focus({ preventScroll: true });
      document.querySelector('#discover')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } else if (target.matches('.filter-button[data-filter], .chip[data-filter]')) {
      activeFilter = target.dataset.filter;
      renderWorlds();
      if (target.classList.contains('side-link')) {
        document.querySelector('#discover')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    } else if (target.matches('[data-share-world]')) {
      const id = target.dataset.shareWorld;
      if (worldById[id]) copyText(worldURL(id), worldDetail, 'World link');
    } else if (target.matches('[data-share-plan]')) {
      sharePlan(target.dataset.sharePlan, target);
    } else if (target.matches('[data-delete-plan]')) {
      const id = target.dataset.deletePlan;
      const removed = plans.find(plan => plan.id === id);
      if (!removed) return;
      plans = plans.filter(plan => plan.id !== id);
      const persisted = persist(STORAGE_PLANS, plans);
      renderGatherings();
      const nextControl = gatheringList?.querySelector('button') || document.querySelector('[data-plan-gathering]');
      nextControl?.focus({ preventScroll: true });
      notify(persisted ? 'Gathering plan removed.' : 'Plan removed for this visit. Browser storage is unavailable.');
    }
  });

  search?.addEventListener('input', renderWorlds);
  planName?.addEventListener('input', () => planName.setCustomValidity(''));
  planDate?.addEventListener('input', () => planDate.setCustomValidity(''));
  planForm?.addEventListener('submit', event => {
    event.preventDefault();
    const name = planName.value.trim();
    const selectedWorld = planWorld.value;
    const date = new Date(planDate.value);
    planName.setCustomValidity(name ? '' : 'Give your gathering a name.');
    planDate.setCustomValidity(Number.isFinite(date.getTime()) && date.getTime() > Date.now() ? '' : 'Choose a date and time in the future.');
    if (!worldById[selectedWorld] || !planForm.reportValidity()) {
      if (planFeedback) planFeedback.textContent = 'Add a gathering name and a future date and time.';
      return;
    }
    const plan = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      world: selectedWorld, name: name.slice(0, 70), date: date.toISOString(),
      note: planNote.value.trim().slice(0, 400),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    };
    plans.push(plan);
    const persisted = persist(STORAGE_PLANS, plans);
    renderGatherings();
    planDialog.close();
    document.querySelector('#gatherings')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    notify(persisted ? 'Gathering plan saved on this device. Copy it to share with your people.' : 'Gathering plan created for this visit only. Browser storage is unavailable; copy your plan to keep it.');
  });

  [worldDialog, planDialog].filter(Boolean).forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (dialog === worldDialog) {
        currentWorld = null;
        clearWorldHash();
      }
      const opener = dialogOpeners.get(dialog);
      dialogOpeners.delete(dialog);
      if (opener?.isConnected && !document.querySelector('dialog[open]')) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });

  function applyHash() {
    const match = window.location.hash.match(/^#world=(aether|verdant|observatory)$/);
    if (match) {
      if (planDialog?.open) planDialog.close();
      openWorld(match[1], document.activeElement, false);
    } else if (worldDialog?.open && currentWorld) {
      worldDialog.close();
    }
  }

  window.addEventListener('hashchange', applyHash);
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_SAVED) {
      saved.clear();
      readStored(STORAGE_SAVED).forEach(id => { if (worldById[id]) saved.add(id); });
      renderWorlds();
    }
  });

  renderWorlds();
  renderGatherings();
  applyHash();
})();
