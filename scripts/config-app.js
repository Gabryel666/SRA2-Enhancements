// SRA2-Enhancements: Custom Configuration Application
const MOD_ID = 'sra2-enhancements';

/**
 * FormApplication with sections (💰 🔊 🖥️ 🙈).
 * Hide section uses a collapse toggle for the long list.
 */
class SRA2ConfigApp extends FormApplication {
    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: 'sra2-enhancements-config',
            title: 'SRA2: Enhancements — Configuration',
            template: 'modules/sra2-enhancements/templates/config-app.hbs',
            width: 680,
            height: 640,
            closeOnSubmit: true,
            submitOnChange: false
        };
    }

    /* ── Gather current settings ── */
    getData() {
        const settings = {};
        const keys = [
            'enableItemCashCost', 'cashCostEquipment', 'cashCostWeapon', 'cashCostArmor',
            'cashCostCyberware', 'cashCostCyberdeck', 'cashCostVehicle',
            'sheetOpenSound', 'sheetCloseSound',
            'hideDragMeasurement', 'hideFormatBar', 'chatControlsBelow',
            'sidebarExpandOnStart', 'sidebarDefaultTab',
            'hideChatPeek', 'autoUnpauseGM', 'hotbarCollapsed',
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
            if (key.startsWith('_')) continue;
            try {
                const setting = game.settings.settings.get(`${MOD_ID}.${key}`);
                if (!setting) continue;

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

        ui.notifications.info('SRA2: Enhancements — Configuration sauvegardée.');

        // Re-apply UI settings immediately
        const { reapplyUI } = await import('./sra2-ui.js');
        reapplyUI();

        // Reload if sidebar startup changed
        const needsReload = data.sidebarExpandOnStart !== game.settings.get(MOD_ID, 'sidebarExpandOnStart');
        if (needsReload) {
            setTimeout(() => window.location.reload(), 1500);
        }
    }

    /* ── Activate listeners ── */
    activateListeners(html) {
        super.activateListeners(html);

        // Collapse button for the hide section
        html.find('.sra2-collapse-btn').click((ev) => {
            const btn = ev.currentTarget;
            const targetId = btn.dataset.target;
            const panel = document.getElementById(targetId);
            if (!panel) return;

            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            btn.querySelector('.sra2-collapse-icon').textContent = isHidden ? '▼' : '▶';
            btn.textContent = btn.textContent.replace(
                isHidden ? 'Afficher' : 'Masquer',
                isHidden ? 'Masquer' : 'Afficher'
            );
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

// Exposed on window for settings.js to registerMenu
window.SRA2ConfigApp = SRA2ConfigApp;
