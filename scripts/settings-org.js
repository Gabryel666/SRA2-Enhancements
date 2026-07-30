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
    // ── 1. Transformer les séparateurs en titres ──
    const sections = ['_sec_economy', '_sec_sound', '_sec_interface', '_sec_hide'];
    for (const key of sections) {
        const group = html.find(`.form-group[data-setting-id="${MOD_ID}.${key}"]`);
        if (!group.length) continue;
        group.addClass('sra2-section-separator');

        if (key === '_sec_hide') {
            // ── 2. Remplacer le champ vide du séparateur CACHER par un bouton ──
            const field = group.find('.form-fields');
            field.empty(); // vide le champ input inutile

            const btn = $(`<button type="button" class="sra2-collapse-btn">
                <span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer
            </button>`);
            field.append(btn);

            // Cacher les toggles au départ
            for (const k of HIDE_TOGGLES) {
                const g = html.find(`.form-group[data-setting-id="${MOD_ID}.${k}"]`);
                if (g.length) g.hide();
            }

            // Click handler
            btn.on('click', function() {
                const toggles = html.find(HIDE_TOGGLES.map(k =>
                    `.form-group[data-setting-id="${MOD_ID}.${k}"]`).join(','));
                const show = toggles.first().is(':visible') === false;
                toggles.toggle(show);
                btn.html(`<span class="sra2-collapse-icon">${show ? '▼' : '▶'}</span> `
                    + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
            });
        } else {
            // Les autres séparateurs : juste cacher le champ
            group.find('.form-fields').hide();
        }
    }
});
