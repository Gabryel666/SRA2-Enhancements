// SRA2-Enhancements: Organisation visuelle des paramètres
// Utilise le texte du label pour trouver les sections (compatible v12-v14+)

const MOD_ID = 'sra2-enhancements';

// Associe chaque clé de section à son texte de label exact
const SECTION_LABELS = {
    '_sec_economy':  '💰 ÉCONOMIE',
    '_sec_sound':    '🔊 SONS',
    '_sec_interface':'🖥️ INTERFACE',
    '_sec_hide':     '🙈 CACHER'
};

const HIDE_TOGGLES = [
    'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
    'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
    'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
    'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
];

// Labels des toggles à cacher (match par texte du label)
const HIDE_LABELS = HIDE_TOGGLES.map(k => '🙈 ' + {
    hideNavComplete: 'Cacher la barre de navigation',
    hideControls: 'Cacher la barre d\'outils gauche',
    hideHotbar: 'Cacher la hotbar',
    hideLogo: 'Cacher le logo',
    hidePlayers: 'Cacher la liste des joueurs',
    hideTabChat: 'Cacher l\'onglet Chat',
    hideTabCombat: 'Cacher l\'onglet Combat',
    hideTabScenes: 'Cacher l\'onglet Scènes',
    hideTabActors: 'Cacher l\'onglet Acteurs',
    hideTabItems: 'Cacher l\'onglet Objets',
    hideTabJournal: 'Cacher l\'onglet Journal',
    hideTabTables: 'Cacher l\'onglet Tables',
    hideTabCards: 'Cacher l\'onglet Objets plaçables',
    hideTabMacros: 'Cacher l\'onglet Macros',
    hideTabPlaylists: 'Cacher l\'onglet Playlists',
    hideTabCompendium: 'Cacher l\'onglet Compendium',
    hideTabSettings: 'Cacher l\'onglet Paramètres'
}[k]);

export function initSettingsOrg() {
    Hooks.on('renderSettingsConfig', _onRenderSettingsConfig);
}

/**
 * Trouve un form-group dont le label correspond exactement au texte donné.
 * Compatible tous formats Foundry (data-setting-id, data-key, ou sans attribut).
 */
function findGroupByLabel(html, labelText) {
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && lbl.text().trim() === labelText;
    }).first();
}

/**
 * Trouve un form-group par texte partiel dans le label.
 */
function findGroupByPartialLabel(html, partialText) {
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && lbl.text().includes(partialText);
    }).first();
}

function _onRenderSettingsConfig(app, html) {
    // ── 1. Transformer les séparateurs en titres ──
    for (const [key, label] of Object.entries(SECTION_LABELS)) {
        const group = findGroupByLabel(html, label);
        if (!group.length) {
            console.warn('SRA2-ORG | Section not found:', label, key);
            continue;
        }
        group.addClass('sra2-section-separator');

        if (key === '_sec_hide') {
            _injectCollapseButton(group, html);
        } else {
            // Cacher le champ input
            group.find('.form-fields').hide();
        }
    }
}

function _injectCollapseButton(group, html) {
    // Protection anti-duplication
    if (group.find('.sra2-collapse-btn').length) return;

    // Soit .form-fields existe, soit on crée un conteneur
    let container = group.find('.form-fields');
    if (container.length) {
        container.empty();
    } else {
        container = $('<div class="form-fields"></div>');
        group.append(container);
    }

    const btn = $(`<button type="button" class="sra2-collapse-btn">
        <span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer
    </button>`);
    container.append(btn);

    // Cacher les toggles au départ
    for (const lbl of HIDE_LABELS) {
        const el = findGroupByPartialLabel(html, lbl);
        if (el.length) el.hide();
    }

    // Click handler
    btn.on('click', function() {
        // Déterminer si on doit montrer ou cacher
        const first = findGroupByPartialLabel(html, HIDE_LABELS[0]);
        const show = !first.length || !first.is(':visible');

        for (const lbl of HIDE_LABELS) {
            const el = findGroupByPartialLabel(html, lbl);
            if (el.length) el.toggle(show);
        }

        btn.html(`<span class="sra2-collapse-icon">${show ? '▼' : '▶'}</span> `
            + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
    });
}
