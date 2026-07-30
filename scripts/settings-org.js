// SRA2-Enhancements: Organisation visuelle des paramètres
// Transforme les séparateurs en titres de section + bouton collapse pour Cacher.

const MOD_ID = 'sra2-enhancements';

const HIDE_TOGGLES = [
    'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
    'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
    'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
    'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
];

Hooks.on('renderSettingsConfig', (app, html, data) => {
    // ── 1. Séparateurs → titres de section ──
    const sections = ['_sec_economy', '_sec_sound', '_sec_interface', '_sec_hide'];
    for (const key of sections) {
        const group = html.find(`.form-group[data-setting-id="${MOD_ID}.${key}"]`);
        if (!group.length) continue;
        group.addClass('sra2-section-separator');
        group.find('input, select, button').hide();
    }

    // ── 2. Cacher les toggles (masqués, dépliés par le bouton) ──
    for (const key of HIDE_TOGGLES) {
        const group = html.find(`.form-group[data-setting-id="${MOD_ID}.${key}"]`);
        if (group.length) group.addClass('sra2-hide-toggle');
    }

    // ── 3. Bouton collapse après le séparateur CACHER ──
    const hideSection = html.find(`.form-group[data-setting-id="${MOD_ID}._sec_hide"]`);
    if (!hideSection.length) return;
    // Éviter de dupliquer si le hook est re-déclenché
    if (hideSection.next().hasClass('sra2-collapse-wrapper')) return;

    const wrapper = $('<div class="sra2-collapse-wrapper"></div>');
    const btn = $('<button type="button" class="sra2-collapse-btn">'
        + '<span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer</button>');
    wrapper.append(btn);
    hideSection.after(wrapper);

    btn.on('click', function() {
        const toggles = html.find('.sra2-hide-toggle');
        const show = toggles.first().is(':visible') === false;
        toggles.toggle(show);
        btn.html(`<span class="sra2-collapse-icon">${show ? '▼' : '▶'}</span> `
            + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
    });

    // ── 4. État initial : caché ──
    html.find('.sra2-hide-toggle').hide();
});
