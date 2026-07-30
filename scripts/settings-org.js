/**
 * SRA2-Enhancements — Organisation des paramètres en catégories
 *
 * Patche SettingsConfig._prepareContext pour diviser notre unique
 * catégorie "SRA2: Enhancements" en 4 sous-catégories :
 *   💰 ÉCONOMIE | 🔊 SONS | 🖥️ INTERFACE | 🙈 CACHER
 *
 * Fonctionne avec Foundry VTT v14 (ApplicationV2).
 * N'utilise AUCUN hack DOM — les données sont restructurées avant le template.
 */

const MOD_ID = 'sra2-enhancements';

// ── Map : clé de setting → groupe ──────────────────────────────────
const _groupMap = {
  enableItemCashCost: 'economy',
  cashCostEquipment:  'economy',
  cashCostWeapon:     'economy',
  cashCostArmor:      'economy',
  cashCostCyberware:  'economy',
  cashCostCyberdeck:  'economy',
  cashCostVehicle:    'economy',
  sheetOpenSound:     'sounds',
  sheetCloseSound:    'sounds',
  hideDragMeasurement:'interface',
  hideFormatBar:      'interface',
  chatControlsBelow:  'interface',
  sidebarExpandOnStart:'interface',
  sidebarDefaultTab:  'interface',
  hideChatPeek:       'interface',
  hotbarCollapsed:    'interface',
  autoUnpauseGM:      'interface',
  hideNavComplete:    'hide',
  hideControls:       'hide',
  hideHotbar:         'hide',
  hideLogo:           'hide',
  hidePlayers:        'hide',
  hideTabChat:        'hide',
  hideTabCombat:      'hide',
  hideTabScenes:      'hide',
  hideTabActors:      'hide',
  hideTabItems:       'hide',
  hideTabJournal:     'hide',
  hideTabTables:      'hide',
  hideTabCards:       'hide',
  hideTabMacros:      'hide',
  hideTabPlaylists:   'hide',
  hideTabCompendium:  'hide',
  hideTabSettings:    'hide',
};

const _defaultGroup = 'interface';

const _groups = {
  economy:   { id: 'sra2-economy',   label: '💰 ÉCONOMIE', sort: 1 },
  sounds:    { id: 'sra2-sounds',    label: '🔊 SONS',    sort: 2 },
  interface: { id: 'sra2-interface', label: '🖥️ INTERFACE', sort: 3 },
  hide:      { id: 'sra2-hide',      label: '🙈 CACHER',   sort: 4 },
};

// ── Cherche SettingsConfig de façon fiable ─────────────────────────
function _getSettingsConfig() {
  return foundry?.applications?.settings?.SettingsConfig
      || globalThis.SettingsConfig
      || null;
}

// ── Patch : _prepareContext ────────────────────────────────────────
function _patchPrepareContext(SC) {
  const orig = SC.prototype._prepareContext;

  SC.prototype._prepareContext = async function (options) {
    const ctx = await orig.call(this, options);
    const catMap = ctx.categories;
    if (!catMap || typeof catMap !== 'object') return ctx;

    const ourCat = catMap[MOD_ID];
    if (!ourCat || !Array.isArray(ourCat.entries) || !ourCat.entries.length) return ctx;

    const grouped = { economy: [], sounds: [], interface: [], hide: [] };
    for (const entry of ourCat.entries) {
      const key = entry.key ?? '';
      const g = _groupMap[key] || _defaultGroup;
      if (grouped[g]) grouped[g].push(entry);
      else grouped.interface.push(entry);
    }

    delete catMap[MOD_ID];

    for (const [gk, entries] of Object.entries(grouped)) {
      if (!entries.length) continue;
      const g = _groups[gk];
      catMap[g.id] = { id: g.id, label: g.label, entries };
    }

    return ctx;
  };
}

// ── Patch : _sortCategories ────────────────────────────────────────
function _patchSortCategories(SC) {
  const orig = SC.prototype._sortCategories;

  SC.prototype._sortCategories = function (a, b) {
    const ga = _groups[a.id];
    const gb = _groups[b.id];
    if (ga && gb) return ga.sort - gb.sort;
    if (ga) return -1;
    if (gb) return 1;
    return orig.call(this, a, b);
  };
}

// ── Initialisation ─────────────────────────────────────────────────
export function initSettingsOrg() {
  // On attend que le DOM soit prêt (SettingsConfig chargé)
  Hooks.once('ready', () => {
    const SC = _getSettingsConfig();
    if (!SC) {
      console.warn('SRA2 | SettingsConfig introuvable, patch de catégories ignoré');
      return;
    }
    _patchPrepareContext(SC);
    _patchSortCategories(SC);
    console.log('SRA2 | Catégories de paramètres patchées');
  });
}
