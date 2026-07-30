export function registerSettings() {
    const featTypes = ['Equipment', 'Weapon', 'Armor', 'Cyberware', 'Cyberdeck', 'Vehicle'];

    // Master switch
    game.settings.register('sra2-enhancements', 'enableItemCashCost', {
        name: 'SRA2XPCash.Settings.EnableItemCashCost.Name',
        hint: 'SRA2XPCash.Settings.EnableItemCashCost.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    // Individual toggles
    featTypes.forEach(type => {
        game.settings.register('sra2-enhancements', `cashCost${type}`, {
            name: `SRA2XPCash.Settings.CashCost${type}.Name`,
            hint: `SRA2XPCash.Settings.CashCost${type}.Hint`,
            scope: 'world',
            config: true,
            type: Boolean,
            default: true
        });
    });

    // Internal: migration flag (hidden from config)
    game.settings.register('sra2-enhancements', '_migrated', {
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    // Sound settings
    game.settings.register('sra2-enhancements', 'sheetOpenSound', {
        name: 'SRA2XPCash.Settings.SheetOpenSound.Name',
        hint: 'SRA2XPCash.Settings.SheetOpenSound.Hint',
        scope: 'world',
        config: true,
        type: String,
        default: '',
        filePicker: 'audio'
    });

    game.settings.register('sra2-enhancements', 'sheetCloseSound', {
        name: 'SRA2XPCash.Settings.SheetCloseSound.Name',
        hint: 'SRA2XPCash.Settings.SheetCloseSound.Hint',
        scope: 'world',
        config: true,
        type: String,
        default: '',
        filePicker: 'audio'
    });
}

export function isItemCashEnabled(featType) {
    if (!game.settings.get('sra2-enhancements', 'enableItemCashCost')) return false;
    if (!featType) return false;

    // capitalize first letter to match setting key
    const typeKey = featType.charAt(0).toUpperCase() + featType.slice(1).toLowerCase();

    // check if this specific type toggle exists and is enabled
    try {
        return game.settings.get('sra2-enhancements', `cashCost${typeKey}`);
    } catch (e) {
        // setting doesn't exist for this type, means it's not a cash-applicable type
        return false;
    }
}
