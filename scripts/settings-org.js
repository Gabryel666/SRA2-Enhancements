// SRA2-Enhancements: Organisation visuelle des paramètres
// Match par label text, réordonne le DOM pour grouper les settings sous leurs sections.

const MOD_ID = 'sra2-enhancements';

// Mapping section → clés des settings
const SECTION_MAP = {
    'ECONOMIE':  ['enableItemCashCost','cashCostEquipment','cashCostWeapon','cashCostArmor','cashCostCyberware','cashCostCyberdeck','cashCostVehicle'],
    'SONS':      ['sheetOpenSound','sheetCloseSound'],
    'INTERFACE': ['hideDragMeasurement','hideFormatBar','chatControlsBelow','sidebarExpandOnStart','sidebarDefaultTab','hideChatPeek','hotbarCollapsed','autoUnpauseGM'],
    'HIDE':      ['hideNavComplete','hideControls','hideHotbar','hideLogo','hidePlayers','hideTabChat','hideTabCombat','hideTabScenes','hideTabActors','hideTabItems','hideTabJournal','hideTabTables','hideTabCards','hideTabMacros','hideTabPlaylists','hideTabCompendium','hideTabSettings']
};

// Texte exact des labels des séparateurs de section
const SECTION_LABELS = {
    ECONOMIE:  '💰 ÉCONOMIE',
    SONS:      '🔊 SONS',
    INTERFACE: '🖥️ INTERFACE',
    HIDE:      '🙈 CACHER'
};

// Texte DISTINCTIF pour matcher chaque setting (une sous-chaîne unique du label)
const KEY_LABEL = {
    enableItemCashCost:'Activer le coût en Cash',
    cashCostEquipment:'Equipement',
    cashCostWeapon:'Weapon',
    cashCostArmor:'Armor',
    cashCostCyberware:'Cyberware',
    cashCostCyberdeck:'Cyberdeck',
    cashCostVehicle:'Vehicle',
    sheetOpenSound:"Son à l'ouverture",
    sheetCloseSound:'Son à la fermeture',
    hideDragMeasurement:'Cacher la ligne de distance',
    hideFormatBar:'Cacher la barre de formatage',
    chatControlsBelow:'Contrôles du chat sous la saisie',
    sidebarExpandOnStart:'Sidebar ouverte',
    sidebarDefaultTab:'Onglet par défaut',
    hideChatPeek:'mini-chat',
    hotbarCollapsed:'hotbar réduite',
    autoUnpauseGM:'sans pause',
    hideNavComplete:'Cacher la barre de navigation',
    hideControls:"Cacher la barre d'outils gauche",
    hideHotbar:'Cacher la hotbar',
    hideLogo:'Cacher le logo',
    hidePlayers:'Cacher la liste des joueurs',
    hideTabChat:"Cacher l'onglet Chat",
    hideTabCombat:"Cacher l'onglet Combat",
    hideTabScenes:"Cacher l'onglet Scènes",
    hideTabActors:"Cacher l'onglet Acteurs",
    hideTabItems:"Cacher l'onglet Objets",
    hideTabJournal:"Cacher l'onglet Journal",
    hideTabTables:"Cacher l'onglet Tables",
    hideTabCards:'Objets plaçables',
    hideTabMacros:"Cacher l'onglet Macros",
    hideTabPlaylists:"Cacher l'onglet Playlists",
    hideTabCompendium:"Cacher l'onglet Compendium",
    hideTabSettings:"Cacher l'onglet Paramètres"
};

export function initSettingsOrg() {
    Hooks.on('renderSettingsConfig', onRender);
}

function findExact(html, text) {
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && lbl.text().trim() === text;
    }).first();
}

function findByText(html, text) {
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && lbl.text().includes(text);
    }).first();
}

function findAllByText(html, text) {
    return html.find('.form-group').filter(function() {
        const lbl = $(this).find('label');
        return lbl.length && lbl.text().includes(text);
    });
}

function findSetting(html, key) {
    const labelPart = KEY_LABEL[key];
    if (!labelPart) return $([]);
    // D'abord essayer exact, puis contient
    const el = findAllByText(html, labelPart);
    if (el.length) return el;
    return findByText(html, labelPart);
}

function onRender(app, html) {
    for (const [secName, label] of Object.entries(SECTION_LABELS)) {
        const section = findExact(html, label);
        if (!section.length) {
            console.warn('SRA2-ORG | Section not found:', label);
            continue;
        }
        section.addClass('sra2-section-separator');

        // Réordonner : déplacer chaque setting sous sa section
        const keys = SECTION_MAP[secName];
        let anchor = section;

        for (const k of keys) {
            const el = findSetting(html, k);
            if (el.length) {
                anchor.after(el);
                anchor = el;
            }
        }

        // Section CACHER → bouton collapse
        if (secName === 'HIDE') {
            injectCollapseButton(section, html, keys);
        } else {
            section.find('.form-fields').hide();
        }
    }
}

function injectCollapseButton(section, html, keys) {
    if (section.find('.sra2-collapse-btn').length) return;

    let container = section.find('.form-fields');
    if (container.length) {
        container.empty();
    } else {
        container = $('<div class="form-fields"></div>');
        section.append(container);
    }

    const btn = $('<button type="button" class="sra2-collapse-btn">'
        + '<span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer'
        + '</button>');
    container.append(btn);

    // Cacher les toggles au départ
    for (const k of keys) {
        const el = findSetting(html, k);
        if (el.length) el.hide();
    }

    btn.on('click', function() {
        const first = findSetting(html, keys[0]);
        const show = !first.length || !first.is(':visible');
        for (const k of keys) {
            const el = findSetting(html, k);
            if (el.length) el.toggle(show);
        }
        btn.html('<span class="sra2-collapse-icon">' + (show ? '▼' : '▶') + '</span> '
            + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
    });
}
