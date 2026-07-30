// SRA2-Enhancements: Organisation visuelle des paramètres
// SCRIPT CLASSIQUE (pas ES module) — chargé via module.json "scripts"
// Trouve les sections par label text et réordonne le DOM

const SRA2_ORG_MOD_ID = 'sra2-enhancements';

const SRA2_ORG_SECTION_MAP = {
    'ECONOMIE':  ['enableItemCashCost','cashCostEquipment','cashCostWeapon','cashCostArmor','cashCostCyberware','cashCostCyberdeck','cashCostVehicle'],
    'SONS':      ['sheetOpenSound','sheetCloseSound'],
    'INTERFACE': ['hideDragMeasurement','hideFormatBar','chatControlsBelow','sidebarExpandOnStart','sidebarDefaultTab','hideChatPeek','hotbarCollapsed','autoUnpauseGM'],
    'HIDE':      ['hideNavComplete','hideControls','hideHotbar','hideLogo','hidePlayers','hideTabChat','hideTabCombat','hideTabScenes','hideTabActors','hideTabItems','hideTabJournal','hideTabTables','hideTabCards','hideTabMacros','hideTabPlaylists','hideTabCompendium','hideTabSettings']
};

const SRA2_ORG_SECTION_LABELS = {
    ECONOMIE:  '💰 ÉCONOMIE',
    SONS:      '🔊 SONS',
    INTERFACE: '🖥️ INTERFACE',
    HIDE:      '🙈 CACHER'
};

const SRA2_ORG_KEY_LABEL = {
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

Hooks.on('renderSettingsConfig', function(app, html) {
    for (var secName in SRA2_ORG_SECTION_LABELS) {
        var label = SRA2_ORG_SECTION_LABELS[secName];
        var section = null;
        html.find('.form-group').each(function() {
            var lbl = $(this).find('label');
            if (lbl.length && lbl.text().trim() === label) {
                section = $(this);
                return false;
            }
        });
        if (!section) {
            console.warn('SRA2-ORG | Section not found:', label);
            continue;
        }
        section.addClass('sra2-section-separator');

        var keys = SRA2_ORG_SECTION_MAP[secName];
        var anchor = section;

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var keyLabel = SRA2_ORG_KEY_LABEL[k];
            if (!keyLabel) continue;
            var el = null;
            html.find('.form-group').each(function() {
                var lbl = $(this).find('label');
                if (lbl.length && lbl.text().indexOf(keyLabel) !== -1) {
                    el = $(this);
                    return false;
                }
            });
            if (el) {
                anchor.after(el);
                anchor = el;
            }
        }

        if (secName === 'HIDE') {
            // Collapse button
            if (!section.find('.sra2-collapse-btn').length) {
                var container = section.find('.form-fields');
                if (!container.length) {
                    container = $('<div class="form-fields"></div>');
                    section.append(container);
                }
                container.empty();
                var btn = $('<button type="button" class="sra2-collapse-btn">'
                    + '<span class="sra2-collapse-icon">▶</span> Afficher les éléments à masquer'
                    + '</button>');
                container.append(btn);

                // Cacher les toggles
                var hideKeys = SRA2_ORG_SECTION_MAP['HIDE'];
                for (var j = 0; j < hideKeys.length; j++) {
                    var hl = SRA2_ORG_KEY_LABEL[hideKeys[j]];
                    if (!hl) continue;
                    html.find('.form-group').each(function() {
                        var lbl = $(this).find('label');
                        if (lbl.length && lbl.text().indexOf(hl) !== -1) {
                            $(this).hide();
                        }
                    });
                }

                btn.on('click', function() {
                    var firstHL = SRA2_ORG_KEY_LABEL[hideKeys[0]];
                    var firstEl = null;
                    html.find('.form-group').each(function() {
                        var lbl = $(this).find('label');
                        if (lbl.length && lbl.text().indexOf(firstHL) !== -1) {
                            firstEl = $(this);
                            return false;
                        }
                    });
                    var show = !firstEl || !firstEl.is(':visible');
                    for (var j2 = 0; j2 < hideKeys.length; j2++) {
                        var hl2 = SRA2_ORG_KEY_LABEL[hideKeys[j2]];
                        if (!hl2) continue;
                        html.find('.form-group').each(function() {
                            var lbl = $(this).find('label');
                            if (lbl.length && lbl.text().indexOf(hl2) !== -1) {
                                $(this).toggle(show);
                            }
                        });
                    }
                    btn.html('<span class="sra2-collapse-icon">' + (show ? '▼' : '▶') + '</span> '
                        + (show ? 'Masquer les éléments' : 'Afficher les éléments à masquer'));
                });
            }
        } else {
            section.find('.form-fields').hide();
        }
    }
});
