import { D as DiploRibbonData } from '/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js'
import briOptions from '../options/bri-options.js';

setTimeout(() => {
  const prototype = Object.getPrototypeOf(DiploRibbonData);
  const createPlayerYieldsData = prototype.createPlayerYieldsData;
  prototype.createPlayerYieldsData = function (playerLibrary, isLocal) {
    const data = createPlayerYieldsData.call(this, playerLibrary, isLocal);

    try {
      if (briOptions.ShowCombatPower === false) {
        console.warn(`${briOptions.modID}: Skipping Combat Power due to briOptions.ShowCombatPower: (${briOptions.ShowCombatPower})`);
        return data;
      }

      /* Add Combat Power Info */
      let combatPower = 0;
      playerLibrary.Units.getUnits().forEach(unit => {
        if (!unit.isCombat) {
          return;
        }
        if (unit.Combat.rangedStrength > 0) {
          combatPower += unit.Combat.rangedStrength;
        } else {
          combatPower += unit.Combat.getMeleeStrength(false);
        }
      });

      const production = playerLibrary.Stats?.getNetYield(YieldTypes.YIELD_PRODUCTION);
      data.push({
        type: 'default',
        label: "Combat Power",
        value: Math.ceil(production * 0.2 + combatPower * 0.7),
        img: `<img src='${UI.getIconURL("DIPLOMACY_DECLARE_FORMAL_WAR_ICON")}'>`,
        details: "Combat Power",
        rawValue: Math.ceil(production * 0.6 + combatPower * 1),
        warningThreshold: Infinity,
      },)
    }
    catch (e) {
      console.error(`${briOptions.modID}: player-combat-power error: ${e}`);
    }

    /* End Additions */
    return data;
  }
  DiploRibbonData.updateAll();
}, 100);
