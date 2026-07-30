// SRA2-Enhancements: Custom Configuration Application
const MOD_ID = 'sra2-enhancements';

/**
 * FormApplication with tabbed sections for all module settings.
 */
export class SRA2ConfigApp extends FormApplication {
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: 'sra2-enhancements-config',
            title: 'SRA2: Enhancements — Configuration',
            template: 'modules/sra2-enhancements/templates/config-app.hbs',
            width: 720,
            height: 620,
            closeOnSubmit: true,
            submitOnChange: false,
            tabs: [
                { navSelector: '.sra2-config-tabs', contentSelector: '.sra2-config-body', initial: 'economy' }
            ]
        };
    }

    /* ── Gather current settings ── */
    getData() {
        const settings = {};
        const keys = [
            // Economy
            'enableItemCashCost', 'cashCostEquipment', 'cashCostWeapon', 'cashCostArmor',
            'cashCostCyberware', 'cashCostCyberdeck', 'cashCostVehicle',
            // Sound
            'sheetOpenSound', 'sheetCloseSound',
            // Interface
            'hideDragMeasurement', 'hideFormatBar', 'chatControlsBelow',
            'sidebarExpandOnStart', 'sidebarDefaultTab',
            'hideChatPeek', 'autoUnpauseGM',
            // Hide
            'hideNavComplete', 'hideControls', 'hideHotbar', 'hideLogo', 'hidePlayers',
            'hideTabChat', 'hideTabCombat', 'hideTabScenes', 'hideTabActors', 'hideTabItems',
            'hideTabJournal', 'hideTabTables', 'hideTabCards', 'hideTabMacros',
            'hideTabPlaylists', 'hideTabCompendium', 'hideTabSettings'
        ];
        for (const key of keys) {
            try {
                settings[key] = game.settings.get(MOD_ID, key);
            } catch (e) {
                settings[key] = null;
            }
        }
        return { settings };
    }

    /* ── Save settings ── */
    async _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        const updates = [];

        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue; // skip internal keys
            try {
                const setting = game.settings.settings.get(`${MOD_ID}.${key}`);
                if (!setting) continue;

                // Cast to the correct type
                let typedValue;
                switch (setting.type) {
                    case Boolean:
                        typedValue = value === true || value === 'true' || value === 'on';
                        break;
                    case Number:
                        typedValue = Number(value);
                        break;
                    default:
                        typedValue = String(value);
                }

                updates.push(game.settings.set(MOD_ID, key, typedValue));
            } catch (e) {
                console.error(`SRA2 Config | Failed to set ${key}:`, e);
            }
        }

        await Promise.all(updates);

        // Notify and reload if needed
        ui.notifications.info('SRA2: Enhancements — Configuration sauvegardée.');

        // Re-apply UI settings immediately (except those needing reload)
        const { reapplyUI } = await import('./sra2-ui.js');
        reapplyUI();

        // Check if a reload is needed
        const needsReload = data.sidebarExpandOnStart !== game.settings.get(MOD_ID, 'sidebarExpandOnStart');
        if (needsReload) {
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    /* ── Activate listeners ── */
    activateListeners(html) {
        super.activateListeners(html);

        // Tab switching
        html.find('.sra2-tab').click((ev) => {
            const tab = ev.currentTarget.dataset.tab;
            html.find('.sra2-tab').removeClass('active');
            $(ev.currentTarget).addClass('active');
            html.find('.sra2-tab-content').removeClass('active');
            html.find(`.sra2-tab-content[data-tab="${tab}"]`).addClass('active');
        });

        // File picker buttons
        html.find('.sra2-fp-btn').click(async (ev) => {
            const btn = ev.currentTarget;
            const target = btn.dataset.target;
            const type = btn.dataset.type || 'audio';
            const fp = new FilePicker({
                type: type,
                current: html.find(`[name="${target}"]`).val(),
                callback: (path) => {
                    html.find(`[name="${target}"]`).val(path);
                }
            });
            fp.render();
        });
    }
}
