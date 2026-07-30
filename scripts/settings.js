export function registerSettings() {
    const MOD_ID = 'sra2-enhancements';

    // ── 💰 ÉCONOMIE ──
    game.settings.register(MOD_ID, 'enableItemCashCost', {
        name: '💰 Activer le coût en Cash',
        hint: 'Si activé, le Cash sera utilisable sur les objets.',
        scope: 'world', config: true, type: Boolean, default: true
    });
    const econTypes = ['Equipment', 'Weapon', 'Armor', 'Cyberware', 'Cyberdeck', 'Vehicle'];
    for (const type of econTypes) {
        game.settings.register(MOD_ID, `cashCost${type}`, {
            name: `💰 Coût en Cash — ${type}`,
            scope: 'world', config: true, type: Boolean, default: true
        });
    }

    // ── 🔊 SONS ──
    game.settings.register(MOD_ID, 'sheetOpenSound', {
        name: '🔊 Son à l\'ouverture',
        hint: 'Joué à l\'ouverture d\'une fiche de personnage.',
        scope: 'world', config: true, type: String, default: '', filePicker: 'audio'
    });
    game.settings.register(MOD_ID, 'sheetCloseSound', {
        name: '🔊 Son à la fermeture',
        hint: 'Joué à la fermeture d\'une fiche de personnage.',
        scope: 'world', config: true, type: String, default: '', filePicker: 'audio'
    });

    // ── 🖥️ INTERFACE ──
    const interfaceSettings = [
        ['hideDragMeasurement', '🖥️ Cacher la ligne de distance', 'Cache la ligne quand vous mesurez une distance. L\'icône règle reste visible.'],
        ['hideFormatBar', '🖥️ Cacher la barre de formatage', 'Cache la barre de formatage (gras/italique/etc.) dans le chat.'],
        ['chatControlsBelow', '🖥️ Contrôles du chat sous la saisie', 'Déplace les boutons (public/privé/poubelle) sous le champ de saisie.'],
        ['sidebarExpandOnStart', '🖥️ Sidebar ouverte au démarrage', 'La barre latérale s\'ouvre automatiquement au chargement.'],
        ['sidebarDefaultTab', '🖥️ Onglet par défaut', 'Quel onglet de la sidebar est actif au démarrage.',
            { chat: 'Chat', combat: 'Combat', scenes: 'Scènes', actors: 'Acteurs',
              items: 'Objets', journal: 'Journal', tables: 'Tables', cards: 'Objets plaçables',
              macros: 'Macros', playlists: 'Playlists', compendium: 'Compendium', settings: 'Paramètres' }],
        ['hideChatPeek', '🖥️ Cacher le mini-chat (chat peek)', 'Cache l\'aperçu du chat quand vous êtes sur un autre onglet.'],
        ['hotbarCollapsed', '🖥️ Démarrer la hotbar réduite', 'La hotbar se charge en mode réduit. Un bouton ↵ permet de l\'agrandir/réduire.'],
        ['autoUnpauseGM', '🖥️ Démarrer sans pause (MJ)', 'Quand un MJ charge le monde, la pause est automatiquement levée.'],
    ];
    for (const s of interfaceSettings) {
        const opts = {
            scope: 'world', config: true, type: s[3] ? String : Boolean,
            default: s[3] ? 'chat' : false,
            name: s[1], hint: s[2]
        };
        if (s[3]) opts.choices = s[3];
        game.settings.register(MOD_ID, s[0], opts);
    }

    // ── 🙈 CACHER ──
    const hideSettings = [
        ['hideNavComplete', '🙈 Cacher la barre de navigation'],
        ['hideControls',    '🙈 Cacher la barre d\'outils gauche'],
        ['hideHotbar',      '🙈 Cacher la hotbar'],
        ['hideLogo',        '🙈 Cacher le logo'],
        ['hidePlayers',     '🙈 Cacher la liste des joueurs'],
        ['hideTabChat',     '🙈 Cacher l\'onglet Chat'],
        ['hideTabCombat',   '🙈 Cacher l\'onglet Combat'],
        ['hideTabScenes',   '🙈 Cacher l\'onglet Scènes'],
        ['hideTabActors',   '🙈 Cacher l\'onglet Acteurs'],
        ['hideTabItems',    '🙈 Cacher l\'onglet Objets'],
        ['hideTabJournal',  '🙈 Cacher l\'onglet Journal'],
        ['hideTabTables',   '🙈 Cacher l\'onglet Tables'],
        ['hideTabCards',    '🙈 Cacher l\'onglet Objets plaçables'],
        ['hideTabMacros',   '🙈 Cacher l\'onglet Macros'],
        ['hideTabPlaylists','🙈 Cacher l\'onglet Playlists'],
        ['hideTabCompendium','🙈 Cacher l\'onglet Compendium'],
        ['hideTabSettings', '🙈 Cacher l\'onglet Paramètres'],
    ];
    for (const [key, name] of hideSettings) {
        game.settings.register(MOD_ID, key, {
            name: name,
            scope: 'world', config: true, type: Boolean, default: false
        });
    }

    // Migration flag (caché)
    game.settings.register(MOD_ID, '_migrated', {
        scope: 'world', config: false, type: Boolean, default: false
    });
}

export function isItemCashEnabled(featType) {
    if (!game.settings.get('sra2-enhancements', 'enableItemCashCost')) return false;
    if (!featType) return false;
    const typeKey = featType.charAt(0).toUpperCase() + featType.slice(1).toLowerCase();
    try {
        return game.settings.get('sra2-enhancements', `cashCost${typeKey}`);
    } catch (e) {
        return false;
    }
}
