// SRA2-Enhancements: UI Tweaks logic (v14 compatible)
const MOD_ID = 'sra2-enhancements';

function toggleBodyClass(className, enabled) {
    document.body.classList.toggle(className, !!enabled);
}

// ── 1. Drag Measurement (CSS only — v14 n'a pas de setting core pour ça) ──
function applyDragMeasurement() {
    const hide = game.settings.get(MOD_ID, 'hideDragMeasurement');
    toggleBodyClass('sra2-hide-drag-measure', hide);
}

// ── 2. Format toolbar ────────────────────────────────
function applyFormatBar() {
    const hide = game.settings.get(MOD_ID, 'hideFormatBar');
    toggleBodyClass('sra2-hide-format-bar', hide);
}

// ── 3. Chat controls below input ─────────────────────
function applyChatControlsBelow() {
    const enabled = game.settings.get(MOD_ID, 'chatControlsBelow');
    toggleBodyClass('sra2-chat-controls-below', enabled);

    // Move DOM elements when enabling
    const chatControls = document.getElementById('chat-controls');
    const chatForm = document.getElementById('chat-form');
    const chatLog = document.getElementById('chat-log');

    if (enabled && chatControls && chatForm && chatLog) {
        // Move chat-controls AFTER chat-form in the DOM
        if (chatControls.nextElementSibling !== chatForm) {
            chatControls.parentElement.insertBefore(chatControls, chatForm.nextSibling);
        }
    } else if (!enabled && chatControls && chatForm) {
        // Restore original position: after chat-log
        if (chatControls.previousElementSibling !== chatLog) {
            chatControls.parentElement.insertBefore(chatControls, chatForm);
        }
    }
}

// ── 4. Sidebar open on load + tab ────────────────────
function applySidebarStartup() {
    const enabled = game.settings.get(MOD_ID, 'sidebarExpandOnStart');
    if (!enabled) return;
    const tab = game.settings.get(MOD_ID, 'sidebarDefaultTab') || 'chat';

    // Wait for the sidebar to be fully initialized
    let tries = 0;
    const maxTries = 10;
    const tick = () => {
        tries++;
        try {
            const sb = ui.sidebar;
            if (!sb || !sb.element) {
                if (tries < maxTries) { setTimeout(tick, 300); }
                return;
            }

            // Activate tab using Foundry v14 API
            if (typeof sb.activateTab === 'function') {
                sb.activateTab(tab);
            }

            // Expand if collapsed
            if (sb._collapsed || sb.element[0]?.classList.contains('collapsed')) {
                if (typeof sb.expand === 'function') {
                    sb.expand();
                }
            }

            console.log('SRA2 UI | Sidebar opened on tab:', tab);
        } catch (e) {
            console.error('SRA2 UI | Sidebar startup error:', e);
            if (tries < maxTries) setTimeout(tick, 300);
        }
    };
    tick();
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

// ── 6. Hide chat peek (mini chat) ────────────────────
function applyHideChatPeek() {
    toggleBodyClass('sra2-hide-chat-peek', game.settings.get(MOD_ID, 'hideChatPeek'));
}

// ── 7. Auto-unpause for GMs ──────────────────────────
function applyAutoUnpause() {
    if (!game.settings.get(MOD_ID, 'autoUnpauseGM')) return;
    if (!game.user?.isGM) return;

    let tries = 0;
    const tick = () => {
        tries++;
        try {
            const isPaused = !!game.paused;
            if (!isPaused) return;
            game.togglePause(false);
        } catch(e) {
            if (tries < 6) setTimeout(tick, 200);
        }
    };
    tick();
}

// ── Apply all UI tweaks ──────────────────────────────
export function applyAllUI() {
    applyDragMeasurement();
    applyFormatBar();
    applyChatControlsBelow();
    applyHideElements();
    applyHideChatPeek();
    applyAutoUnpause();
    applySidebarStartup();
}

// ── Re-apply after settings saved (called from config-app) ──
export function reapplyUI() {
    // Small delay to let settings commit
    setTimeout(() => {
        applyDragMeasurement();
        applyFormatBar();
        applyChatControlsBelow();
        applyHideElements();
        applyHideChatPeek();
        // Sidebar startup and auto-unpause need reload, not re-applied
    }, 100);
}
