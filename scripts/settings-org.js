// SRA2-Enhancements: Organisation visuelle des paramètres
// Appelé explicitement depuis init.js

const MOD_ID = 'sra2-enhancements';

// Foundry v12+ utilise data-setting-id, v14 a peut-être changé pour data-key ou autre format
function findGroup(html, key) {
    const selectors = [
        `.form-group[data-setting-id="${MOD_ID}.${key}"]`,  // v12-v13
        `.form-group[data-key="${MOD_ID}.${key}"]`,          // v14 possible
        `.form-group[data-setting="${key}"]`,                 // autre format
        `.form-group[data-id="${key}"]`,                      // autre format
    ];
    for (const s of selectors) {
        const g = html.find(s);
        if (g.length) return g;
    }
    // Dernier recours : chercher par texte du label
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && (lbl.text().includes(key) || lbl.text().includes(key.replace('_sec_', '').toUpperCase()));
    }).first();
}

const HIDE_TOGGLES = [
    'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
    'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
    'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
    'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
];

export function initSettingsOrg() {
    Hooks.on('renderSettingsConfig', _onRenderSettingsConfig);
}

function _onRenderSettingsConfig(app, html) {
    const sectionKeys = ['_sec_economy', '_sec_sound', '_sec_interface', '_sec_hide'];

    for (const key of sectionKeys) {
        const group = findGroup(html, key);
        if (!group.length) {
            console.warn('SRA2-ORG | Section not found:', key);
            continue;
        }
        group.addClass('sra2-section-separator');

        if (key === '_sec_hide') {
            _injectCollapseButton(group, html);
        } else {
            // Cacher le champ input pour les séparateurs normaux
            const fields = group.find('.form-fields');
            if (fields.length) fields.hide();
            else group.find('input, select').hide(); // fallback si .form-fields absent
        }
    }
}

function _injectCollapseButton(group, html) {
    // Protection anti-duplication
    if (group.find('.sra2-collapse-btn').length) return;

    // Remplacer le champ par un bouton collapse
    const fields = group.find('.form-fields');
    if (fields.length) {
        fields.empty();
    }

    const btn = $(`<button type="button" class="sra2-collapse-btn">
        <span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer
    </button>`);

    if (fields.length) {
        fields.append(btn);
    } else {
        // Fallback : insérer après le label
        const label = group.find('label');
        if (label.length) label.after(btn);
        else group.append(btn);
    }

    // Cacher les toggles au départ
    for (const k of HIDE_TOGGLES) {
        const el = findGroup(html, k);
        if (el.length) el.hide();
    }

    // Click handler
    btn.on('click', function() {
        let anyVisible = false;
        for (const k of HIDE_TOGGLES) {
            const el = findGroup(html, k);
            if (el.length && el.is(':visible')) { anyVisible = true; break; }
        }
        const show = !anyVisible;
        for (const k of HIDE_TOGGLES) {
            const el = findGroup(html, k);
            if (el.length) el.toggle(show);
        }
        btn.html(`<span class="sra2-collapse-icon">${show ? '▼' : '▶'}</span> `
            + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
    });
}
