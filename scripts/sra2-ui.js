// SRA2-Enhancements: UI Tweaks logic (v14 compatible)
const MOD_ID = 'sra2-enhancements';

function toggleBodyClass(className, enabled) {
    document.body.classList.toggle(className, !!enabled);
}

// ── 1. Drag Measurement (CSS only) ────────────────
function applyDragMeasurement() {
    toggleBodyClass('sra2-hide-drag-measure', game.settings.get(MOD_ID, 'hideDragMeasurement'));
}

// ── 2. Format toolbar ─────────────────────────────
function applyFormatBar() {
    toggleBodyClass('sra2-hide-format-bar', game.settings.get(MOD_ID, 'hideFormatBar'));
}

// ── 3. Chat controls below input ──────────────────
function applyChatControlsBelow() {
    const enabled = game.settings.get(MOD_ID, 'chatControlsBelow');
    toggleBodyClass('sra2-chat-controls-below', enabled);
    // DOM move is done via renderChatLog hook — see below
}

// Called on every chat render to keep the DOM in the right order
function _moveChatControls() {
    const enabled = game.settings.get(MOD_ID, 'chatControlsBelow');
    if (!enabled) return;

    const chatControls = document.getElementById('chat-controls');
    const chatForm = document.getElementById('chat-form');
    if (!chatControls || !chatForm) return;

    // Only move if not already in the right position
    const hb = chatForm.querySelector('.sra2-hb-toggle');
    if (chatControls.compareDocumentPosition(chatForm) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return; // chat-controls is already after chat-form, good
    }
    chatControls.parentElement.insertBefore(chatControls, chatForm.nextSibling);
}

// ── 4. Sidebar open on load + tab ─────────────────
function applySidebarStartup() {
    const enabled = game.settings.get(MOD_ID, 'sidebarExpandOnStart');
    if (!enabled) return;
    const tab = game.settings.get(MOD_ID, 'sidebarDefaultTab') || 'chat';

    let tries = 0;
    const tick = () => {
        tries++;
        try {
            const sb = ui.sidebar;
            if (!sb || !sb.element) {
                if (tries < 10) { setTimeout(tick, 300); return; }
                return;
            }
            if (typeof sb.activateTab === 'function') sb.activateTab(tab);
            if (sb._collapsed || sb.element[0]?.classList.contains('collapsed')) {
                if (typeof sb.expand === 'function') sb.expand();
            }
        } catch (e) {
            if (tries < 10) setTimeout(tick, 300);
        }
    };
    tick();
}

// ── 5. Hide UI elements ───────────────────────────
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

// ── 6. Hide chat peek ─────────────────────────────
function applyHideChatPeek() {
    toggleBodyClass('sra2-hide-chat-peek', game.settings.get(MOD_ID, 'hideChatPeek'));
}

// ── 7. Auto-unpause for GMs ───────────────────────
function applyAutoUnpause() {
    if (!game.settings.get(MOD_ID, 'autoUnpauseGM')) return;
    if (!game.user?.isGM) return;
    let tries = 0;
    const tick = () => {
        tries++;
        try { if (!game.paused) return; game.togglePause(false); }
        catch(e) { if (tries < 6) setTimeout(tick, 200); }
    };
    tick();
}

// ── 8. Hotbar collapsed toggle ────────────────────
let _hotbarCollapsed = false;

function _updateHotbarBtn() {
    const btn = document.getElementById('sra2-hb-toggle');
    if (!btn) return;
    btn.innerHTML = _hotbarCollapsed ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
    btn.title = _hotbarCollapsed ? 'Agrandir la hotbar' : 'Réduire la hotbar';
}

function applyHotbarCollapsed() {
    _hotbarCollapsed = game.settings.get(MOD_ID, 'hotbarCollapsed');
    toggleBodyClass('sra2-hotbar-collapsed', _hotbarCollapsed);
    _updateHotbarBtn();
}

function injectHotbarToggle() {
    const hb = document.getElementById('hotbar');
    if (!hb || document.getElementById('sra2-hb-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'sra2-hb-toggle';
    btn.type = 'button';
    btn.className = 'ui-control icon sra2-hb-toggle';
    btn.innerHTML = _hotbarCollapsed ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
    btn.title = _hotbarCollapsed ? 'Agrandir la hotbar' : 'Réduire la hotbar';

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _hotbarCollapsed = !_hotbarCollapsed;
        toggleBodyClass('sra2-hotbar-collapsed', _hotbarCollapsed);
        _updateHotbarBtn();
        game.settings.set(MOD_ID, 'hotbarCollapsed', _hotbarCollapsed).catch(() => {});
    });

    const controls = hb.querySelector('.hotbar-controls') || hb;
    controls.prepend(btn);
}

// ── Apply all UI tweaks ───────────────────────────
export function applyAllUI() {
    applyDragMeasurement();
    applyFormatBar();
    applyChatControlsBelow();
    _moveChatControls();
    applyHideElements();
    applyHideChatPeek();
    applyAutoUnpause();
    applyHotbarCollapsed();
    applySidebarStartup();
}

// ── Re-apply after settings saved ─────────────────
export function reapplyUI() {
    setTimeout(() => {
        applyDragMeasurement();
        applyFormatBar();
        applyChatControlsBelow();
        _moveChatControls();
        applyHideElements();
        applyHideChatPeek();
        applyHotbarCollapsed();
    }, 100);
}

// ── Hooks ─────────────────────────────────────────
Hooks.on('renderHotbar', () => setTimeout(injectHotbarToggle, 50));

// Re-move chat controls every time the chat is rendered (Foundry rebuilds DOM on tab switch)
Hooks.on('renderChatLog', () => setTimeout(_moveChatControls, 50));
