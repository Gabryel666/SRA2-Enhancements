export function registerSettings() {
    const MOD_ID = 'sra2-enhancements';

    // ── Séparateurs de sections (config:true, displayed as headings via CSS) ──
    const sections = [
        { key: '_sec_economy',  name: '💰 ÉCONOMIE',  hint: 'Gestion des coûts en Cash et séparation XP/Cash.' },
        { key: '_sec_sound',    name: '🔊 SONS',      hint: 'Fichiers audio joués à l\'ouverture/fermeture des fiches.' },
        { key: '_sec_interface', name: '🖥️ INTERFACE', hint: 'Personnalisation du chat, de la sidebar et des mesures.' },
        { key: '_sec_hide',     name: '🙈 CACHER',    hint: 'Éléments à masquer. Bouton pour déplier la liste complète.' },
    ];
    for (const s of sections) {
        game.settings.register(MOD_ID, s.key, {
            name: s.name,
            hint: s.hint,
            scope: 'world', config: true, type: String, default: ''
        });
    }

    // ── ÉCONOMIE ──
    game.settings.register(MOD_ID, 'enableItemCashCost', {
        name: '💰 Activer le coût en Cash',
        hint: 'Si activé, le Cash sera utilisable sur les objets.',
        scope: 'world', config: true, type: Boolean, default: true
    });
    ['Equipment', 'Weapon', 'Armor', 'Cyberware', 'Cyberdeck', 'Vehicle'].forEach(type => {
        game.settings.register(MOD_ID, `cashCost${type}`, {
            name: `💰 Coût en Cash — ${type}`,
            scope: 'world', config: true, type: Boolean, default: true
        });
    });

    // ── SONS ──
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

    // ── INTERFACE ──
    game.settings.register(MOD_ID, 'hideDragMeasurement', {
        name: '🖥️ Cacher la ligne de distance',
        hint: 'Cache la ligne quand vous mesurez une distance. L\'icône règle reste visible.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'hideFormatBar', {
        name: '🖥️ Cacher la barre de formatage',
        hint: 'Cache la barre de formatage (gras/italique/etc.) dans le chat.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'chatControlsBelow', {
        name: '🖥️ Contrôles du chat sous la saisie',
        hint: 'Déplace les boutons (public/privé/poubelle) sous le champ de saisie.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'sidebarExpandOnStart', {
        name: '🖥️ Sidebar ouverte au démarrage',
        hint: 'La barre latérale s\'ouvre automatiquement au chargement.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'sidebarDefaultTab', {
        name: '🖥️ Onglet par défaut',
        hint: 'Quel onglet de la sidebar est actif au démarrage.',
        scope: 'world', config: true, type: String, default: 'chat',
        choices: {
            chat: 'Chat', combat: 'Combat', scenes: 'Scènes', actors: 'Acteurs',
            items: 'Objets', journal: 'Journal', tables: 'Tables', cards: 'Objets plaçables',
            macros: 'Macros', playlists: 'Playlists', compendium: 'Compendium',
            settings: 'Paramètres'
        }
    });
    game.settings.register(MOD_ID, 'hideChatPeek', {
        name: '🖥️ Cacher le mini-chat (chat peek)',
        hint: 'Cache l\'aperçu du chat quand vous êtes sur un autre onglet.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'hotbarCollapsed', {
        name: '🖥️ Démarrer la hotbar réduite',
        hint: 'La hotbar se charge en mode réduit. Un bouton ↵ permet de l\'agrandir/réduire.',
        scope: 'world', config: true, type: Boolean, default: false
    });
    game.settings.register(MOD_ID, 'autoUnpauseGM', {
        name: '🖥️ Démarrer sans pause (MJ)',
        hint: 'Quand un MJ charge le monde, la pause est automatiquement levée.',
        scope: 'world', config: true, type: Boolean, default: false
    });

    // ── CACHER — ces settings sont masqués par défaut, visibles via bouton collapse ──
    const hideBools = [
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
    for (const [key, name] of hideBools) {
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
