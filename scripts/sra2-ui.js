// SRA2-Enhancements: UI Tweaks logic
const MOD_ID = 'sra2-enhancements';

// ── Helpers ──────────────────────────────────────────
function getS(key) { return game.settings.get(MOD_ID, key); }
function setS(key, val) { return game.settings.set(MOD_ID, key, val); }

// Toggle a body class based on setting value
function toggleBodyClass(className, enabled) {
    document.body.classList.toggle(className, !!enabled);
}

// ── 1. Drag Measurement ─────────────────────────────
function applyDragMeasurement() {
    const hide = getS('hideDragMeasurement');
    toggleBodyClass('sra2-hide-drag-measure', hide);
    // Also force the core setting so the measurement line is not drawn
    if (hide && game.settings.get('core', 'dragMeasurement') !== false) {
        game.settings.set('core', 'dragMeasurement', false).catch(() => {});
    }
}

// ── 2. Format toolbar ────────────────────────────────
function applyFormatBar() {
    toggleBodyClass('sra2-hide-format-bar', getS('hideFormatBar'));
}

// ── 3. Chat controls below input ─────────────────────
function applyChatControlsBelow() {
    toggleBodyClass('sra2-chat-controls-below', getS('chatControlsBelow'));
}

// ── 4. Sidebar open on load + tab ────────────────────
async function applySidebarStartup() {
    const enabled = getS('sidebarExpandOnStart');
    const tab = getS('sidebarDefaultTab') || 'chat';
    if (!enabled) return;

    // Wait a bit for the sidebar to be fully initialized
    setTimeout(() => {
        try {
            const sidebar = ui.sidebar;
            if (!sidebar) return;

            // Activate the chosen tab
            sidebar.activateTab(tab);

            // Expand the sidebar if collapsed
            if (sidebar._collapsed) {
                sidebar.expand();
            }
        } catch (e) {
            console.error('SRA2 Enhancements | Failed to set sidebar startup tab:', e);
        }
    }, 500);
}

// ── 5. Hide UI elements (per tab / general) ──────────
function applyHideElements() {
    // General elements
    toggleBodyClass('sra2-hide-nav-complete', getS('hideNavComplete'));
    toggleBodyClass('sra2-hide-controls', getS('hideControls'));
    toggleBodyClass('sra2-hide-hotbar', getS('hideHotbar'));
    toggleBodyClass('sra2-hide-logo', getS('hideLogo'));
    toggleBodyClass('sra2-hide-players', getS('hidePlayers'));

    // Sidebar tabs
    const tabs = ['chat', 'combat', 'scenes', 'actors', 'items', 'journal',
                  'tables', 'cards', 'macros', 'playlists', 'compendium', 'settings'];
    for (const tab of tabs) {
        const settingKey = `hideTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
        toggleBodyClass(`sra2-hide-tab-${tab}`, getS(settingKey));
    }
}

// ── Settings Registration ────────────────────────────
export function registerUISettings() {
    // ── Category: Interface ──
    game.settings.register(MOD_ID, 'hideDragMeasurement', {
        name: 'SRA2UI.Settings.HideDragMeasurement.Name',
        hint: 'SRA2UI.Settings.HideDragMeasurement.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyDragMeasurement()
    });
    game.settings.register(MOD_ID, 'hideFormatBar', {
        name: 'SRA2UI.Settings.HideFormatBar.Name',
        hint: 'SRA2UI.Settings.HideFormatBar.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyFormatBar()
    });
    game.settings.register(MOD_ID, 'chatControlsBelow', {
        name: 'SRA2UI.Settings.ChatControlsBelow.Name',
        hint: 'SRA2UI.Settings.ChatControlsBelow.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyChatControlsBelow()
    });
    game.settings.register(MOD_ID, 'sidebarExpandOnStart', {
        name: 'SRA2UI.Settings.SidebarExpandOnStart.Name',
        hint: 'SRA2UI.Settings.SidebarExpandOnStart.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        requiresReload: true
    });
    game.settings.register(MOD_ID, 'sidebarDefaultTab', {
        name: 'SRA2UI.Settings.SidebarDefaultTab.Name',
        hint: 'SRA2UI.Settings.SidebarDefaultTab.Hint',
        scope: 'world', config: true, type: String, default: 'chat',
        choices: {
            'chat': 'SRA2UI.Settings.SidebarDefaultTab.Chat',
            'combat': 'SRA2UI.Settings.SidebarDefaultTab.Combat',
            'scenes': 'SRA2UI.Settings.SidebarDefaultTab.Scenes',
            'actors': 'SRA2UI.Settings.SidebarDefaultTab.Actors',
            'items': 'SRA2UI.Settings.SidebarDefaultTab.Items',
            'journal': 'SRA2UI.Settings.SidebarDefaultTab.Journal',
            'tables': 'SRA2UI.Settings.SidebarDefaultTab.Tables',
            'cards': 'SRA2UI.Settings.SidebarDefaultTab.Cards',
            'macros': 'SRA2UI.Settings.SidebarDefaultTab.Macros',
            'playlists': 'SRA2UI.Settings.SidebarDefaultTab.Playlists',
            'compendium': 'SRA2UI.Settings.SidebarDefaultTab.Compendium',
            'settings': 'SRA2UI.Settings.SidebarDefaultTab.Settings'
        },
        requiresReload: true
    });

    // ── Category: Hide UI Elements ──
    game.settings.register(MOD_ID, 'hideNavComplete', {
        name: 'SRA2UI.Settings.HideNavComplete.Name',
        hint: 'SRA2UI.Settings.HideNavComplete.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyHideElements()
    });
    game.settings.register(MOD_ID, 'hideControls', {
        name: 'SRA2UI.Settings.HideControls.Name',
        hint: 'SRA2UI.Settings.HideControls.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyHideElements()
    });
    game.settings.register(MOD_ID, 'hideHotbar', {
        name: 'SRA2UI.Settings.HideHotbar.Name',
        hint: 'SRA2UI.Settings.HideHotbar.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyHideElements()
    });
    game.settings.register(MOD_ID, 'hideLogo', {
        name: 'SRA2UI.Settings.HideLogo.Name',
        hint: 'SRA2UI.Settings.HideLogo.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyHideElements()
    });
    game.settings.register(MOD_ID, 'hidePlayers', {
        name: 'SRA2UI.Settings.HidePlayers.Name',
        hint: 'SRA2UI.Settings.HidePlayers.Hint',
        scope: 'world', config: true, type: Boolean, default: false,
        onChange: () => applyHideElements()
    });

    // Sidebar tab toggles
    const tabConfigs = [
        { key: 'chat', name: 'SRA2UI.Settings.HideTabChat.Name', hint: 'SRA2UI.Settings.HideTabChat.Hint' },
        { key: 'combat', name: 'SRA2UI.Settings.HideTabCombat.Name', hint: 'SRA2UI.Settings.HideTabCombat.Hint' },
        { key: 'scenes', name: 'SRA2UI.Settings.HideTabScenes.Name', hint: 'SRA2UI.Settings.HideTabScenes.Hint' },
        { key: 'actors', name: 'SRA2UI.Settings.HideTabActors.Name', hint: 'SRA2UI.Settings.HideTabActors.Hint' },
        { key: 'items', name: 'SRA2UI.Settings.HideTabItems.Name', hint: 'SRA2UI.Settings.HideTabItems.Hint' },
        { key: 'journal', name: 'SRA2UI.Settings.HideTabJournal.Name', hint: 'SRA2UI.Settings.HideTabJournal.Hint' },
        { key: 'tables', name: 'SRA2UI.Settings.HideTabTables.Name', hint: 'SRA2UI.Settings.HideTabTables.Hint' },
        { key: 'cards', name: 'SRA2UI.Settings.HideTabCards.Name', hint: 'SRA2UI.Settings.HideTabCards.Hint' },
        { key: 'macros', name: 'SRA2UI.Settings.HideTabMacros.Name', hint: 'SRA2UI.Settings.HideTabMacros.Hint' },
        { key: 'playlists', name: 'SRA2UI.Settings.HideTabPlaylists.Name', hint: 'SRA2UI.Settings.HideTabPlaylists.Hint' },
        { key: 'compendium', name: 'SRA2UI.Settings.HideTabCompendium.Name', hint: 'SRA2UI.Settings.HideTabCompendium.Hint' },
        { key: 'settings', name: 'SRA2UI.Settings.HideTabSettings.Name', hint: 'SRA2UI.Settings.HideTabSettings.Hint' },
    ];
    for (const cfg of tabConfigs) {
        const settingKey = `hideTab${cfg.key.charAt(0).toUpperCase() + cfg.key.slice(1)}`;
        game.settings.register(MOD_ID, settingKey, {
            name: cfg.name, hint: cfg.hint,
            scope: 'world', config: true, type: Boolean, default: false,
            onChange: () => applyHideElements()
        });
    }
}

// ── Apply all UI tweaks on ready ─────────────────────
export function applyAllUI() {
    applyDragMeasurement();
    applyFormatBar();
    applyChatControlsBelow();
    applyHideElements();

    if (getS('sidebarExpandOnStart')) {
        applySidebarStartup();
    }
}
