// SRA2-Enhancements: Organisation visuelle des paramètres
// Appelé explicitement depuis init.js (pas de side-effect import)

const MOD_ID = 'sra2-enhancements';

const HIDE_TOGGLES = [
    'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
    'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
    'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
    'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
];

/**
 * Initialise le hook renderSettingsConfig.
 * À appeler dans le Hooks.once('init') ou au top-level.
 */
export function initSettingsOrg() {
    Hooks.on('renderSettingsConfig', _onRenderSettingsConfig);
}

function _onRenderSettingsConfig(app, html) {
    // ── 1. Transformer les séparateurs _sec_* en titres ──
    const sectionKeys = ['_sec_economy', '_sec_sound', '_sec_interface', '_sec_hide'];
    for (const key of sectionKeys) {
        const group = html.find(`.form-group[data-setting-id="${MOD_ID}.${key}"]`);
        if (!group.length) continue;
        group.addClass('sra2-section-separator');

        // Cacher le champ input (form-fields) pour les séparateurs normaux
        if (key !== '_sec_hide') {
            group.find('.form-fields').hide();
        }
    }

    // ── 2. Remplacer le champ du séparateur CACHER par un bouton collapse ──
    const hideGroup = html.find(`.form-group[data-setting-id="${MOD_ID}._sec_hide"]`);
    if (!hideGroup.length) return;

    // Éviter de dupliquer le bouton si le hook se déclenche plusieurs fois
    if (hideGroup.find('.sra2-collapse-btn').length) return;

    const formFields = hideGroup.find('.form-fields');
    formFields.empty();

    const btn = $(`<button type="button" class="sra2-collapse-btn">
        <span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer
    </button>`);
    formFields.append(btn);

    // Cacher les toggles au départ
    for (const k of HIDE_TOGGLES) {
        const el = html.find(`.form-group[data-setting-id="${MOD_ID}.${k}"]`);
        if (el.length) el.hide();
    }

    // Click handler sur le bouton
    btn.on('click', function() {
        const selector = HIDE_TOGGLES.map(k =>
            `.form-group[data-setting-id="${MOD_ID}.${k}"]`).join(',');
        const toggles = html.find(selector);
        const show = toggles.length === 0 || toggles.first().is(':visible') === false;

        toggles.toggle(show);
        btn.html(`<span class="sra2-collapse-icon">${show ? '▼' : '▶'}</span> `
            + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
    });
}
