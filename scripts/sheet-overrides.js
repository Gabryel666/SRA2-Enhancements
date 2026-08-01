import { MOD_ID, isItemCashEnabled } from './settings.js';

/**
 * SRA2: Enhancements — Overrides de feuilles
 *
 * Compatibilité Foundry v14 :
 * - Les sheets du système SRA2 sont des ApplicationV1 (ActorSheet/ItemSheet) :
 *   le hook reçoit un objet jQuery → on prend html[0].
 * - Le jour où le système passera en ApplicationV2, le hook recevra un
 *   HTMLElement → on le prend tel quel. Ce module continuera de marcher
 *   sans modification grâce à rootEl().
 * - Audio : game.audio.play() (API v14). Le global AudioHelper a été
 *   retiré du core en v14 (issue #13436) → aucun fallback.
 *
 * Véhicules / Drones (acteurs) :
 * - Le système SRA2 gère les véhicules comme des acteurs liés au personnage
 *   (system.linkedVehicles = tableau d'UUID). Le glissement d'un véhicule
 *   sur une fiche de perso crée une copie (avec matricule) et l'ajoute aux
 *   linkedVehicles.
 * - Ce module applique la même gestion XP/Cash que sur les atouts :
 *   champ « Coût en Cash » sur la fiche véhicule, affichage du coût dans la
 *   liste des véhicules liés, et déduction du Cash à l'acquisition.
 */

/** Retourne le HTMLElement racine quel que soit le type de html (jQuery V1 ou HTMLElement V2). */
function rootEl(html) {
    if (html instanceof HTMLElement) return html;
    if (html && typeof html === 'object' && html[0] instanceof HTMLElement) return html[0];
    return null;
}

/** Lecture d'un son via l'API v14. */
async function playSound(src, volume = 1.0) {
    if (!src) return;
    try {
        await game.audio.play(src, { volume });
    } catch (e) {
        console.warn('SRA2 Enhancements | Lecture du son impossible :', src, e);
    }
}

/** Le coût en Cash d'un document (atout ou véhicule), 0 si absent. */
function getCashCost(doc) {
    return doc?.getFlag?.(MOD_ID, 'cost') || 0;
}

export function setupSheetOverrides() {
    // ── Feuille de personnage : XP/Cash + son d'ouverture + listes ──
    Hooks.on('renderActorSheet', (app, html, data) => {
        const actor = app.document || app.actor;
        if (!actor) return;
        const root = rootEl(html);
        if (!root) return;

        // "Yens" → "XP" dans les zones de coût
        root.querySelectorAll('.price-value .yen-symbol').forEach(el => {
            el.textContent = 'XP';
        });
        root.querySelectorAll('.cost-value, .advanced-cost').forEach(el => {
            el.textContent = el.textContent.replace(/Yens/ig, 'XP').replace(/¥/g, 'XP');
        });

        // Son d'ouverture (uniquement fiches personnage)
        if (actor.type === 'character') {
            const openSound = game.settings.get(MOD_ID, 'sheetOpenSound');
            if (openSound && !app.sra2XpAudioPlayed) {
                playSound(openSound, 1.0);
                app.sra2XpAudioPlayed = true;
            }
        }

        // ── Fiche véhicule : champ Coût en Cash ──
        if (actor.type === 'vehicle') {
            if (isItemCashEnabled('vehicle')) {
                const vehicleCost = root.querySelector('.vehicle-cost');
                // Le Cash remplace le coût natif (XP/Yens) : masquer le bloc coût du système
                if (vehicleCost) vehicleCost.style.display = 'none';

                if (vehicleCost && !root.querySelector('.vehicle-cash-cost')) {
                    const label = game.i18n.localize('SRA2XPCash.UI.VehicleCashCostLabel') || 'Coût en Cash';
                    const currentCashCost = getCashCost(actor);
                    vehicleCost.insertAdjacentHTML('afterend', `
                        <div class="vehicle-cash-cost" style="margin-top: 4px; display: flex; align-items: center; gap: 4px; color: gold; font-weight: bold; font-size: 0.8rem;">
                            <span>${label} : </span>
                            <input type="number" name="flags.${MOD_ID}.cost" value="${currentCashCost}" style="width:60px; text-align:right; border:none; border-bottom:1px solid gold; background:transparent; color:gold; font-weight:bold;" />
                            <span>¥</span>
                        </div>
                    `);
                }
            }
            return;
        }

        // La suite ne concerne que les personnages
        if (actor.type !== 'character') return;

        // Remapper le footer-cash (lié aux yens) en input XP + vrai Cash
        const footerCash = root.querySelector('.footer-cash');
        if (footerCash) {
            const totalCost = actor.system?.totalCost || 0;
            footerCash.innerHTML = '';
            footerCash.insertAdjacentHTML('beforeend', `
                <span class="yen-symbol" style="margin-right: 4px; cursor: help;" title="${game.i18n.localize('SRA2XPCash.UI.TotalXPTooltip')} : ${totalCost} XP">XP : </span>
                <input type="number" name="system.resources.yens" value="${data.system?.resources?.yens || 0}" class="cash-input sra2-xp-input" style="width:50px; text-align:right; border:none; border-bottom:1px solid var(--light-blue); background:transparent; color:var(--light-blue); font-weight:bold; font-size:0.8rem;" />
            `);

            const currentCash = actor.getFlag(MOD_ID, 'cash') || 0;
            footerCash.insertAdjacentHTML('afterend', `
                <div class="footer-actual-cash" style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-left: 15px; font-weight: bold; color: var(--light-blue); font-size: 0.8rem;">
                    <span class="yen-symbol">Cash : </span>
                    <input type="number" name="flags.${MOD_ID}.cash" value="${currentCash}" class="cash-input sra2-cash-mod-input" style="width:70px; text-align:right; border:none; border-bottom:1px solid var(--light-blue); background:transparent; color:var(--light-blue); font-weight:bold; font-size:0.8rem;" />
                    <span class="yen-symbol">¥</span>
                </div>
            `);
        }

        // Masquer l'affichage natif du coût total (XP)
        root.querySelectorAll('.cost-label, .price-value').forEach(el => {
            el.style.display = 'none';
        });

        // Injection du coût en Cash dans les listes de la feuille
        root.querySelectorAll('.feat-item, .skill-item').forEach(el => {
            const itemId = el.dataset?.itemId;
            const vehicleUuid = el.dataset?.vehicleUuid;
            if (!itemId && !vehicleUuid) return;
            // Les armes de véhicule sont des skill-item liées au véhicule, pas des véhicules
            if (el.dataset?.weaponId) return;

            let doc = null;
            let featType = null;
            if (itemId) {
                doc = actor.items.get(itemId);
                if (!doc) return;
                featType = doc.system?.featType;
            } else if (vehicleUuid) {
                doc = foundry.utils.fromUuidSync(vehicleUuid);
                if (!doc || doc.type !== 'vehicle') return;
                featType = 'vehicle';
            }
            if (!isItemCashEnabled(featType)) return;

            const cashCost = getCashCost(doc);

            // Ligne d'infos avancées : juste après la ligne de l'item (ou après le groupe cyberdeck)
            let advancedRow = el.nextElementSibling?.classList.contains('advanced-info') ? el.nextElementSibling : null;
            if (!advancedRow && el.closest('.cyberdeck-group')) {
                const sibling = el.closest('.cyberdeck-group').nextElementSibling;
                if (sibling?.classList.contains('advanced-info')) advancedRow = sibling;
            }

            // Masquer le coût XP natif de l'item / véhicule
            const featCost = el.querySelector('.feat-cost');
            if (featCost) featCost.style.display = 'none';

            // Ajouter le coût en Cash à côté du coût XP masqué
            if (advancedRow) {
                const advCost = advancedRow.querySelector('.advanced-cost');
                if (advCost) advCost.style.display = 'none';
                advancedRow.insertAdjacentHTML('beforeend', `<span class="advanced-cash-cost" style="margin-left: 10px; color: gold; opacity: 0.8; font-size: 0.75rem;">${cashCost} ¥</span>`);
            }
        });
    });

    // ── Son à la fermeture ──
    Hooks.on('closeActorSheet', (app, html) => {
        const actor = app.document || app.actor;
        if (!actor || actor.type !== 'character') return;

        // Réinitialise le flag pour le son d'ouverture
        app.sra2XpAudioPlayed = false;

        const closeSound = game.settings.get(MOD_ID, 'sheetCloseSound');
        playSound(closeSound, 1.0);
    });

    // ── Feuille d'atout : champ Coût en Cash uniforme ──
    Hooks.on('renderItemSheet', (app, html, data) => {
        try {
            const item = app.document || app.item || app.object;
            if (!item || item.type !== 'feat') return;
            const root = rootEl(html);
            if (!root) return;

            const featType = item.system?.featType;
            if (!isItemCashEnabled(featType)) return;

            const generalSection = root.querySelector('section[data-section-content="general"]');
            const currentCashCost = getCashCost(item);
            const label = game.i18n.localize('SRA2XPCash.UI.ItemCashCostLabel') || 'Coût en Cash';
            const groupHtml = `
                <div class="form-group cash-cost-group" style="background: rgba(255, 215, 0, 0.05); border-left: 3px solid gold; padding-left: 8px;">
                    <label style="color: gold; text-shadow: 0 0 5px rgba(255,215,0,0.5);">${label}</label>
                    <div style="display: flex; align-items: center;">
                        <input type="number" name="flags.${MOD_ID}.cost" value="${currentCashCost}" title="${label}" style="max-width: 60px; text-align: right; border-color: gold;" />
                        <span style="align-self: center; margin-left: 5px; margin-right: 15px; color: gold; font-weight: bold;">¥</span>
                    </div>
                </div>
            `;

            if (generalSection) {
                // Masquer le coût natif (sélecteur de coût XP) quand le Cash est actif
                const costSelect = generalSection.querySelector('select[name="system.cost"]');
                if (costSelect) {
                    const group = costSelect.closest('.form-group');
                    if (group) group.style.display = 'none';
                }

                // Insérer le champ Cash juste après le groupe de rating
                const ratingGroup = generalSection.querySelector('input[name="system.rating"]')?.closest('.form-group');
                if (ratingGroup) ratingGroup.insertAdjacentHTML('afterend', groupHtml);
                else generalSection.insertAdjacentHTML('afterbegin', groupHtml);
            } else {
                root.querySelector('.sheet-header')?.insertAdjacentHTML('afterend', groupHtml);
            }
        } catch (e) {
            console.error('SRA2 Enhancements | Erreur renderItemSheet :', e);
        }
    });

    // ── Forcer "free-equipment" pour que le système calcule 0 XP ──
    Hooks.on('preCreateItem', (item, data, options, userId) => {
        if (item.type === 'feat' && isItemCashEnabled(item.system?.featType)) {
            item.updateSource({ 'system.cost': 'free-equipment' });
        }
    });

    Hooks.on('preUpdateItem', (item, changes, options, userId) => {
        if (item.type !== 'feat') return;
        const newFeatType = changes.system?.featType !== undefined ? changes.system.featType : item.system.featType;
        if (isItemCashEnabled(newFeatType)) {
            if (!changes.system) changes.system = {};
            changes.system.cost = 'free-equipment';
        }
    });

    // ── Achat : déduction du Cash ──
    Hooks.on('createItem', async (item, options, userId) => {
        if (game.user.id !== userId) return;
        if (!item.parent || item.parent.type !== 'character') return;
        if (item.type !== 'feat') return;
        if (!isItemCashEnabled(item.system?.featType)) return;

        const cashCost = getCashCost(item);
        if (cashCost > 0) {
            const confirm = await Dialog.confirm({
                title: game.i18n.localize('SRA2XPCash.UI.DeductCashTitle') || "Achat d'objet",
                content: `<p>${game.i18n.format('SRA2XPCash.UI.DeductCashPrompt', { cost: cashCost })}</p>`,
                defaultYes: true
            });

            if (confirm) {
                const currentCash = item.parent.getFlag(MOD_ID, 'cash') || 0;
                await item.parent.setFlag(MOD_ID, 'cash', currentCash - cashCost);
                ui.notifications.info(game.i18n.format('SRA2XPCash.UI.CashDeducted', { cost: cashCost }));
            }
        }
    });

    // ── Véhicule : déduction du Cash à l'acquisition (glissement sur la fiche perso) ──
    // Le système crée une copie du véhicule puis ajoute son UUID à system.linkedVehicles.
    // Ce hook détecte l'ajout et propose la déduction, comme pour les atouts.
    Hooks.on('preUpdateActor', (actor, changes, options, userId) => {
        if (game.user.id !== userId) return;
        if (actor.type !== 'character') return;
        if (!changes.system?.linkedVehicles) return;

        const oldUuids = actor.system?.linkedVehicles || [];
        const newUuids = changes.system.linkedVehicles || [];
        const added = newUuids.filter(uuid => !oldUuids.includes(uuid));
        if (!added.length) return;
        if (!isItemCashEnabled('vehicle')) return;

        const vehicle = foundry.utils.fromUuidSync(added[0]);
        if (!vehicle || vehicle.type !== 'vehicle') return;

        const cashCost = getCashCost(vehicle);
        if (cashCost <= 0) return;

        // Différé après l'update en cours (setFlag déclencherait sinon preUpdateActor en boucle)
        setTimeout(async () => {
            const confirm = await Dialog.confirm({
                title: game.i18n.localize('SRA2XPCash.UI.DeductVehicleTitle') || "Acquisition de véhicule",
                content: `<p>${game.i18n.format('SRA2XPCash.UI.DeductVehiclePrompt', { cost: cashCost })}</p>`,
                defaultYes: true
            });

            if (confirm) {
                const currentCash = actor.getFlag(MOD_ID, 'cash') || 0;
                await actor.setFlag(MOD_ID, 'cash', currentCash - cashCost);
                ui.notifications.info(game.i18n.format('SRA2XPCash.UI.CashDeducted', { cost: cashCost }));
            }
        }, 100);
    });
}
