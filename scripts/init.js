import { MOD_ID, registerSettings } from './settings.js';
import { setupSheetOverrides } from './sheet-overrides.js';

Hooks.once('init', () => {
    console.log('SRA2 XP & Cash | Initializing module');
    registerSettings();
});

Hooks.once('ready', async () => {
    console.log('SRA2 XP & Cash | Ready, setting up sheet overrides');
    setupSheetOverrides();

    // Skip migration if already done
    const alreadyMigrated = game.settings.get(MOD_ID, '_migrated');
    if (alreadyMigrated) return;

    // Migrate old flags (safely — old scope may no longer exist)
    if (game.user.isGM) {
        for (const actor of game.actors) {
            try {
                const oldCash = actor.getFlag('sra2-xp-cash', 'cash');
                if (oldCash !== undefined) {
                    await actor.setFlag(MOD_ID, 'cash', oldCash);
                    await actor.unsetFlag('sra2-xp-cash', 'cash');
                }
            } catch (e) { /* old module scope no longer active, skip */ }
            for (const item of actor.items) {
                try {
                    const oldCost = item.getFlag('sra2-xp-cash', 'cost');
                    if (oldCost !== undefined) {
                        await item.setFlag(MOD_ID, 'cost', oldCost);
                        await item.unsetFlag('sra2-xp-cash', 'cost');
                    }
                } catch (e) { /* old module scope no longer active, skip */ }
            }
        }

        // Flag as migrated so we skip this loop on next loads
        await game.settings.set(MOD_ID, '_migrated', true);
        console.log('SRA2 XP & Cash | Migration from old scope complete');
    }
});
