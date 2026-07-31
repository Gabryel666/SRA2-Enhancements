/**
 * SRA2: Enhancements — Organisation visuelle des paramètres
 *
 * Pattern validé (v14.2.8) : hook renderSettingsConfig + séparateurs _sec_*.
 * - Les séparateurs sont enregistrés comme settings normaux (config:true).
 * - Ce hook les transforme en titres de section (CSS) et déplace chaque
 *   paramètre sous sa section (DOM reorder).
 * - Matching par le TEXTE du label (pas data-setting-id, peu fiable en v14).
 * - Le reorder est idempotent : si le hook se re-déclenche, les éléments
 *   déjà à leur place ne bougent pas.
 *
 * ⚠️ Sécurité : ce hook ne touche NI aux inputs NI à la sauvegarde. Il ne
 * déplace que des blocs visuels (.form-group entiers). Les name des champs
 * restent identiques → les paramètres continuent de fonctionner.
 */

const SECTION_MAP = {
    CASH: ['enableItemCashCost', 'cashCostEquipment', 'cashCostWeapon', 'cashCostArmor', 'cashCostCyberware', 'cashCostCyberdeck', 'cashCostVehicle'],
    SOUND: ['sheetOpenSound', 'sheetCloseSound']
};

// Texte EXACT des titres de section (affiché tel quel par Foundry)
const SECTION_LABELS = {
    CASH: '💰 Gestion Cash / XP',
    SOUND: '🔊 Ambiance Audio UI'
};

// Sous-chaînes distinctives des labels (FR + EN) pour matcher chaque paramètre
const KEY_LABEL = {
    enableItemCashCost: ['Activer le coût en Cash', 'Enable Cash Cost'],
    cashCostEquipment: ['Équipement', 'Equipment'],
    cashCostWeapon: ['Armes', 'Weapons'],
    cashCostArmor: ['Armures', 'Armor'],
    cashCostCyberware: ['Cyberware', 'Cyberware'],
    cashCostCyberdeck: ['Cyberdecks', 'Cyberdecks'],
    cashCostVehicle: ['Véhicules/Drones', 'Vehicles/Drones'],
    sheetOpenSound: ['ouverture', 'Open Sound'],
    sheetCloseSound: ['fermeture', 'Close Sound']
};

export function initSettingsOrg() {
    Hooks.on('renderSettingsConfig', onRender);
}

/** HTMLElement racine quel que soit le type de html (jQuery V1 ou HTMLElement V2). */
function rootEl(html) {
    if (html instanceof HTMLElement) return html;
    if (html && typeof html === 'object' && html[0] instanceof HTMLElement) return html[0];
    return null;
}

/** Trouve le .form-group dont le label correspond EXACTEMENT au texte donné. */
function findExact(root, text) {
    const groups = root.querySelectorAll('.form-group');
    for (const g of groups) {
        const label = g.querySelector('label');
        if (label && label.textContent.trim() === text) return g;
    }
    return null;
}

/** Trouve le .form-group dont le label contient l'une des sous-chaînes (FR ou EN). */
function findSetting(root, key) {
    const parts = KEY_LABEL[key];
    if (!parts) return null;
    const groups = root.querySelectorAll('.form-group');
    for (const g of groups) {
        const label = g.querySelector('label');
        if (!label) continue;
        const text = label.textContent;
        if (parts.some(p => text.includes(p))) return g;
    }
    return null;
}

function onRender(app, html) {
    const root = rootEl(html);
    if (!root) return;

    for (const [secName, label] of Object.entries(SECTION_LABELS)) {
        const section = findExact(root, label);
        if (!section) {
            console.warn('SRA2-ORG | Titre de section introuvable :', label);
            continue;
        }

        section.classList.add('sra2-section-separator');
        const fields = section.querySelector('.form-fields');
        if (fields) fields.style.display = 'none';

        // Déplacer chaque paramètre sous sa section (idempotent)
        const keys = SECTION_MAP[secName];
        let anchor = section;
        for (const k of keys) {
            const el = findSetting(root, k);
            if (el && el !== anchor) {
                anchor.after(el);
                anchor = el;
            } else if (!el) {
                console.warn('SRA2-ORG | Paramètre introuvable :', k);
            }
        }
    }
}
