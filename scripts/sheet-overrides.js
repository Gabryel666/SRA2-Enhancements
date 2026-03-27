import { isItemCashEnabled } from './settings.js';

export function setupSheetOverrides() {
    Hooks.on('renderActorSheet', (app, html, data) => {
        // Overwrite standard "Yens" text with "XP" in relevant places for all actors
        html.find('.price-value .yen-symbol').text('XP');
        html.find('.cost-value, .advanced-cost, .feat-cost').each(function () {
            $(this).text($(this).text().replace(/Yens/ig, 'XP').replace(/¥/g, 'XP'));
        });

        // Only inject the separate Cash field on Character sheets
        if (app.actor.type !== 'character') return;

        // Play open sound if configured and not already played for this instance
        const openSound = game.settings.get('sra2-enhancements', 'sheetOpenSound');
        if (openSound && !app.sra2XpAudioPlayed) {
            AudioHelper.play({ src: openSound, volume: 1.0, autoplay: true }, false);
            app.sra2XpAudioPlayed = true;
        }


        // Remap the footer-cash div (which currently bounds to yens) to be our "XP" input
        const footerCash = html.find('.footer-cash');
        if (footerCash.length) {
            const totalXpCost = app.actor.system.totalCost || 0;
            footerCash.empty();
            footerCash.append(`
                <span class="yen-symbol" style="margin-right: 4px; cursor: help;" title="${game.i18n.localize('SRA2XPCash.UI.TotalXPTooltip')} : ${totalXpCost} XP">XP : </span>
                <input type="number" name="system.resources.yens" value="${data.system?.resources?.yens || 0}" class="cash-input sra2-xp-input" style="width:50px; text-align:right; border:none; border-bottom:1px solid var(--light-blue); background:transparent; color:var(--light-blue); font-weight:bold; font-size:0.8rem;" />
            `);

            // Add the real Cash input bounded to proper module flag
            const currentCash = app.actor.getFlag('sra2-enhancements', 'cash') || 0;
            const cashHtml = `
                <div class="footer-actual-cash" style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-left: 15px; font-weight: bold; color: var(--light-blue); font-size: 0.8rem;">
                    <span class="yen-symbol">Cash : </span>
                    <input type="number" name="flags.sra2-enhancements.cash" value="${currentCash}" class="cash-input sra2-cash-mod-input" style="width:70px; text-align:right; border:none; border-bottom:1px solid var(--light-blue); background:transparent; color:var(--light-blue); font-weight:bold; font-size:0.8rem;" />
                    <span class="yen-symbol">¥</span>
                </div>
            `;
            footerCash.after(cashHtml);
        }

        // Hide the original bulky Total Cost display as requested by the user
        html.find('.cost-label').hide();
        html.find('.price-value').hide();
    });

    Hooks.on('closeActorSheet', (app, html) => {
        if (app.actor.type !== 'character') return;

        // Reset the open audio flag
        app.sra2XpAudioPlayed = false;

        // Play close sound if configured
        const closeSound = game.settings.get('sra2-enhancements', 'sheetCloseSound');
        if (closeSound) {
            AudioHelper.play({ src: closeSound, volume: 1.0, autoplay: true }, false);
        }
    });

    Hooks.on('renderItemSheet', (app, html, data) => {
        try {
            // If it's a feat, check if it's the right type
            const item = app.document || app.item || app.object;
            if (!item || item.type !== 'feat') return;

            const featType = item.system?.featType;
            if (!isItemCashEnabled(featType)) return;

            // Ensure we hide the native cost select if the system still generates it
            const generalSection = html.find('section[data-section-content="general"]');
            
            // Always inject our uniform Cash Cost field
            const currentCashCost = item.getFlag('sra2-enhancements', 'cost') || 0;
            const newGroupHtml = `
                <div class="form-group cash-cost-group" style="background: rgba(255, 215, 0, 0.05); border-left: 3px solid gold; padding-left: 8px;">
                    <label style="color: gold; text-shadow: 0 0 5px rgba(255,215,0,0.5);">${game.i18n.localize('SRA2XPCash.UI.ItemCashCostLabel') || 'Coût en Cash'}</label>
                    <div style="display: flex; align-items: center;">
                        <input type="number" name="flags.sra2-enhancements.cost" value="${currentCashCost}" title="${game.i18n.localize('SRA2XPCash.UI.ItemCashCostLabel')}" style="max-width: 60px; text-align: right; border-color: gold;" />
                        <span style="align-self: center; margin-left: 5px; margin-right: 15px; color: gold; font-weight: bold;">¥</span>
                    </div>
                </div>
            `;
            
            if (generalSection.length) {
                const costSelect = generalSection.find('select[name="system.cost"]');
                if (costSelect.length) {
                    // Hide the whole form group containing the native cost
                    costSelect.closest('.form-group').hide();
                }

                // Insert it elegantly right after the rating group
                const ratingGroup = generalSection.find('input[name="system.rating"]').closest('.form-group');
                if (ratingGroup.length) {
                    ratingGroup.after(newGroupHtml);
                } else { generalSection.prepend(newGroupHtml); }
            } else {
                html.find('.sheet-header').after(newGroupHtml);
            }
        } catch(e) {
            console.error('SRA2 Enhancements | Error in renderItemSheet override:', e);
        }
    });

    // Also inject calculated cash cost in Character Sheet lists if possible
    Hooks.on('renderActorSheet', (app, html, data) => {
        try {
            const actor = app.document || app.actor || app.object;
            if (!actor || actor.type !== 'character') return;

            // Loop over feats in the sheet to append their cash cost if applicable
            html.find('.feat-item, .skill-item').each(function () {
                const itemId = $(this).data('itemId') || $(this).attr('data-item-id');
                if (itemId) {
                    const item = actor.items.get(itemId);
                    if (item && isItemCashEnabled(item.system?.featType)) {
                        const cashCost = item.getFlag('sra2-enhancements', 'cost') || 0;
                        
                        // For basic view (next to name or in a specific place)
                        // In SRA2 sheet V2, there's \`.advanced-cost\` inside \`.row.advanced-info\`
                        let advancedRow = $(this).next('.advanced-info');
                        if (!advancedRow.length && $(this).closest('.cyberdeck-group').length) {
                            advancedRow = $(this).closest('.cyberdeck-group').next('.advanced-info');
                        }

                        // Hide the native XP cost elements since it costs Cash
                        $(this).find('.feat-cost').hide();
                        if (advancedRow.length) {
                            advancedRow.find('.advanced-cost').hide();
                            advancedRow.append(`<span class="advanced-cash-cost" style="margin-left: 10px; color: gold; opacity: 0.8; font-size: 0.75rem;">${cashCost} ¥</span>`);
                        } else {
                            // If not in advanced mode, we might append to .name-wrapper
                            const nameWrapper = $(this).find('.name-wrapper');
                            nameWrapper.append(`<span class="cash-badge" style="margin-left:auto; color:gold; font-size:0.75rem;">${cashCost} ¥</span>`);
                        }
                    }
                }
            });
        } catch (e) {
            console.error('SRA2 Enhancements | Error in renderActorSheet list item injection:', e);
        }
    });

    // Enforce "free-equipment" native cost if Cash cost is active, so SRA2 naturally calculates 0 XP
    Hooks.on('preCreateItem', (item, data, options, userId) => {
        if (item.type === 'feat' && isItemCashEnabled(item.system?.featType)) {
            item.updateSource({ "system.cost": "free-equipment" });
        }
    });

    Hooks.on('preUpdateItem', (item, changes, options, userId) => {
        if (item.type !== 'feat') return;
        const newFeatType = changes.system?.featType !== undefined ? changes.system.featType : item.system.featType;
        if (isItemCashEnabled(newFeatType)) {
            if (!changes.system) changes.system = {};
            changes.system.cost = "free-equipment";
        }
    });

    Hooks.on('createItem', async (item, options, userId) => {
        if (game.user.id !== userId) return;
        if (!item.parent || item.parent.type !== 'character') return;
        if (item.type !== 'feat') return;

        if (isItemCashEnabled(item.system?.featType)) {
            const cashCost = item.getFlag('sra2-enhancements', 'cost');
            if (cashCost && cashCost > 0) {
                const confirm = await Dialog.confirm({
                    title: game.i18n.localize("SRA2XPCash.UI.DeductCashTitle") || "Purchase Item",
                    content: `<p>${game.i18n.format("SRA2XPCash.UI.DeductCashPrompt", { cost: cashCost })}</p>`,
                    defaultYes: true
                });

                if (confirm) {
                    const currentCash = item.parent.getFlag('sra2-enhancements', 'cash') || 0;
                    await item.parent.setFlag('sra2-enhancements', 'cash', currentCash - cashCost);
                    ui.notifications.info(game.i18n.format("SRA2XPCash.UI.CashDeducted", { cost: cashCost }));
                }
            }
        }
    });
}
