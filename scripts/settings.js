/**
 * SRA2: Enhancements — Paramètres
 *
 * ─────────────────────────────────────────────────────────────
 *  POUR AJOUTER UN PARAMÈTRE : ajoute une entrée dans SETTINGS.
 *  Champs supportés :
 *    key        → identifiant du paramètre (unique)
 *    name       → clé i18n du libellé (lang/en.json, lang/fr.json)
 *    hint       → clé i18n de l'aide (optionnelle)
 *    type       → Boolean | String | Number
 *    default    → valeur par défaut
 *    filePicker → 'audio' pour un sélecteur de fichier audio
 *    choices    → objet { valeur: libellé } pour les listes
 *    config     → false pour un paramètre interne invisible
 *  Le fichier est trié par sections (Économie, Sons, Interne).
 * ─────────────────────────────────────────────────────────────
 */

export const MOD_ID = 'sra2-enhancements';

const FEAT_TYPES = ['Equipment', 'Weapon', 'Armor', 'Cyberware', 'Cyberdeck', 'Vehicle'];

const SETTINGS = [
    // ── 💰 Économie : coût en Cash ──
    {
        key: 'enableItemCashCost',
        name: 'SRA2XPCash.Settings.EnableItemCashCost.Name',
        hint: 'SRA2XPCash.Settings.EnableItemCashCost.Hint',
        type: Boolean,
        default: true
    },
    ...FEAT_TYPES.map(type => ({
        key: `cashCost${type}`,
        name: `SRA2XPCash.Settings.CashCost${type}.Name`,
        hint: `SRA2XPCash.Settings.CashCost${type}.Hint`,
        type: Boolean,
        default: true
    })),

    // ── 🔊 Sons : ouverture / fermeture de fiche ──
    {
        key: 'sheetOpenSound',
        name: 'SRA2XPCash.Settings.SheetOpenSound.Name',
        hint: 'SRA2XPCash.Settings.SheetOpenSound.Hint',
        type: String,
        default: '',
        filePicker: 'audio'
    },
    {
        key: 'sheetCloseSound',
        name: 'SRA2XPCash.Settings.SheetCloseSound.Name',
        hint: 'SRA2XPCash.Settings.SheetCloseSound.Hint',
        type: String,
        default: '',
        filePicker: 'audio'
    },

    // ── Interne (invisible) ──
    {
        key: '_migrated',
        type: Boolean,
        default: false,
        config: false
    }
];

export function registerSettings() {
    for (const s of SETTINGS) {
        game.settings.register(MOD_ID, s.key, {
            name: s.name,
            hint: s.hint,
            scope: s.scope || 'world',
            config: s.config !== false,
            type: s.type,
            default: s.default,
            ...(s.filePicker ? { filePicker: s.filePicker } : {}),
            ...(s.choices ? { choices: s.choices } : {})
        });
    }
}

/** Un type d'atout (featType système, ex: "equipment") est-il concerné par le coût en Cash ? */
export function isItemCashEnabled(featType) {
    if (!game.settings.get(MOD_ID, 'enableItemCashCost')) return false;
    if (!featType) return false;

    // Met la première lettre en capitale pour matcher la clé (cashCostEquipment, …)
    const typeKey = featType.charAt(0).toUpperCase() + featType.slice(1).toLowerCase();

    try {
        return game.settings.get(MOD_ID, `cashCost${typeKey}`);
    } catch (e) {
        // Le type n'a pas de paramètre dédié → non concerné par le Cash
        return false;
    }
}
