// SRA2-Enhancements: UI Tweaks logic
const MOD_ID = 'sra2-enhancements';

function toggleBodyClass(className, enabled) {
    document.body.classList.toggle(className, !!enabled);
}

// ── 1. Drag Measurement ─────────────────────────────
function applyDragMeasurement() {
    const hide = game.settings.get(MOD_ID, 'hideDragMeasurement');
    toggleBodyClass('sra2-hide-drag-measure', hide);
    if (hide && game.settings.get('core', 'dragMeasurement') !== false) {
        game.settings.set('core', 'dragMeasurement', false).catch(() => {});
    }
}

// ── 2. Format toolbar ────────────────────────────────
function applyFormatBar() {
    toggleBodyClass('sra2-hide-format-bar', game.settings.get(MOD_ID, 'hideFormatBar'));
}

// ── 3. Chat controls below input ─────────────────────
function applyChatControlsBelow() {
    toggleBodyClass('sra2-chat-controls-below', game.settings.get(MOD_ID, 'chatControlsBelow'));
}

// ── 4. Sidebar open on load + tab ────────────────────
function applySidebarStartup() {
    const enabled = game.settings.get(MOD_ID, 'sidebarExpandOnStart');
    if (!enabled) return;
    const tab = game.settings.get(MOD_ID, 'sidebarDefaultTab') || 'chat';

    setTimeout(() => {
        try {
            const sidebar = ui.sidebar;
            if (!sidebar) return;
            sidebar.activateTab(tab);
            if (sidebar._collapsed) sidebar.expand();
        } catch (e) {
            console.error('SRA2 Enhancements | Sidebar startup failed:', e);
        }
    }, 500);
}

// ── 5. Hide UI elements ──────────────────────────────
function applyHideElements() {
    toggleBodyClass('sra2-hide-nav-complete', game.settings.get(MOD_ID, 'hideNavComplete'));
    toggleBodyClass('sra2-hide-controls', game.settings.get(MOD_ID, 'hideControls'));
    toggleBodyClass('sra2-hide-hotbar', game.settings.get(MOD_ID, 'hideHotbar'));
    toggleBodyClass('sra2-hide-logo', game.settings.get(MOD_ID, 'hideLogo'));
    toggleBodyClass('sra2-hide-players', game.settings.get(MOD_ID, 'hidePlayers'));

    const tabs = ['chat', 'combat', 'scenes', 'actors', 'items', 'journal',
                  'tables', 'cards', 'macros', 'playlists', 'compendium', 'settings'];
    for (const tab of tabs) {
        const key = `hideTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
        toggleBodyClass(`sra2-hide-tab-${tab}`, game.settings.get(MOD_ID, key));
    }
}

// ── Apply all UI tweaks ──────────────────────────────
export function applyAllUI() {
    applyDragMeasurement();
    applyFormatBar();
    applyChatControlsBelow();
    applyHideElements();
    applySidebarStartup();
}

// ── onChange watchers (called from init) ─────────────
export function setupUIWatchers() {
    // Re-apply on setting changes (timeout lets the setting commit first)
    const watchKeys = ['hideDragMeasurement', 'hideFormatBar', 'chatControlsBelow',
                       'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
                       'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors',
                       'hideTabItems', 'hideTabJournal', 'hideTabTables', 'hideTabCards',
                       'hideTabMacros', 'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'];

    for (const key of watchKeys) {
        const original = game.settings.settings.get(`${MOD_ID}.${key}`);
        if (original && !original._sra2Watched) {
            const onChange = original.onChange;
            game.settings.settings.get(`${MOD_ID}.${key}`)._sra2Watched = true;
            // Can't easily hook setting changes from the custom app,
            // so we rely on the manual apply after save in config-app.js
        }
    }
}
