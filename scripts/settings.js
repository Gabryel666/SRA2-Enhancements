import { SRA2ConfigApp } from './config-app.js';

export function registerSettings() {
    // ── Register menu (opens custom config app) ──
    game.settings.registerMenu('sra2-enhancements', 'sra2ConfigMenu', {
        name: 'SRA2: Enhancements — Configuration',
        label: 'Configuration',
        hint: 'Ouvrir les paramètres organisés du module.',
        icon: 'fas fa-sliders-h',
        type: SRA2ConfigApp,
        restricted: true
    });

    // ── Settings: now all config: false (managed by the custom app) ──
    const featTypes = ['Equipment', 'Weapon', 'Armor', 'Cyberware', 'Cyberdeck', 'Vehicle'];

    // Master switch
    game.settings.register('sra2-enhancements', 'enableItemCashCost', {
        name: '💰 Activer le coût en Cash global',
        hint: 'Si activé, le Cash sera utilisable sur les objets.',
        scope: 'world', config: false, type: Boolean, default: true
    });

    // Individual toggles
    featTypes.forEach(type => {
        game.settings.register('sra2-enhancements', `cashCost${type}`, {
            name: `💰 Coût en Cash pour les ${type}`,
            hint: '',
            scope: 'world', config: false, type: Boolean, default: true
        });
    });

    // Internal: migration flag (hidden)
    game.settings.register('sra2-enhancements', '_migrated', {
        scope: 'world', config: false, type: Boolean, default: false
    });

    // Sound settings
    game.settings.register('sra2-enhancements', 'sheetOpenSound', {
        name: '🔊 Son à l\'ouverture',
        hint: 'Fichier audio joué à l\'ouverture d\'une fiche de personnage.',
        scope: 'world', config: false, type: String, default: '', filePicker: 'audio'
    });
    game.settings.register('sra2-enhancements', 'sheetCloseSound', {
        name: '🔊 Son à la fermeture',
        hint: 'Fichier audio joué à la fermeture d\'une fiche de personnage.',
        scope: 'world', config: false, type: String, default: '', filePicker: 'audio'
    });

    // ── UI Settings (config: false, managed by custom app) ──
    game.settings.register('sra2-enhancements', 'hideDragMeasurement', {
        name: '🖥️ Cacher la ligne de distance',
        scope: 'world', config: false, type: Boolean, default: false
    });
    game.settings.register('sra2-enhancements', 'hideFormatBar', {
        name: '🖥️ Cacher la barre de formatage',
        scope: 'world', config: false, type: Boolean, default: false
    });
    game.settings.register('sra2-enhancements', 'chatControlsBelow', {
        name: '🖥️ Contrôles du chat sous la saisie',
        scope: 'world', config: false, type: Boolean, default: false
    });
    game.settings.register('sra2-enhancements', 'sidebarExpandOnStart', {
        name: '🖥️ Sidebar au démarrage',
        scope: 'world', config: false, type: Boolean, default: false
    });
    game.settings.register('sra2-enhancements', 'sidebarDefaultTab', {
        name: '🖥️ Onglet par défaut',
        scope: 'world', config: false, type: String, default: 'chat'
    });

    // Hide toggles
    const hideBools = [
        'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
        'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
        'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
        'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
    ];
    for (const key of hideBools) {
        game.settings.register('sra2-enhancements', key, {
            name: `🙈 ${key}`,
            scope: 'world', config: false, type: Boolean, default: false
        });
    }
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
