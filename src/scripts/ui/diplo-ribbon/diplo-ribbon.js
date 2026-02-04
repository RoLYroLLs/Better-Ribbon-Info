import { D as DiploRibbonData } from '/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js'
import BriOptions from '../options/bri-options.js';
import ModLogger from "../../helpers/mod-logger.js";

setTimeout(() => {
  const prototype = Object.getPrototypeOf(DiploRibbonData);
  const original = prototype.createPlayerYieldsData;

  prototype.createPlayerYieldsData = function (playerLibrary, isLocal) {
    const data = original.call(this, playerLibrary, isLocal);

    const playerId = playerLibrary?.id;
    const showFood = BriOptions?.ShowFood !== false;
    const showProduction = BriOptions?.ShowProduction !== false;
    const showPopulation = BriOptions?.ShowPopulation !== false;
    const showCombatPower = BriOptions?.ShowCombatPower !== false;

    ModLogger.debug("Building ribbon yields", { playerId, isLocal });

    // -------------------------
    // Food
    // -------------------------
    if (!showFood) {
      ModLogger.debug("Skipping Food due to briOptions", { ShowFood: BriOptions.ShowFood });
    } else {
      try {
        ModLogger.debug("Adding Food data for player", { playerId: playerLibrary.id });
        const food = playerLibrary.Stats?.getNetYield(YieldTypes.YIELD_FOOD);
        data.push({
          type: 'default',
          label: Locale.compose("LOC_YIELD_FOOD"),
          value: `+${Math.floor(food)}`,
          img: `<img src='${UI.getIconURL("YIELD_FOOD")}'>`,
          details: '',
          rawValue: food,
          warningThreshold: Infinity
        },);
      } catch (e) {
        ModLogger.error("Food render failed", { error: String(e), playerId });
      }
    }

    // -------------------------
    // Production
    // -------------------------
    if (showProduction === false) {
      ModLogger.debug("Skipping Production due to briOptions", { ShowProduction: BriOptions.ShowProduction });
    } else {
      try {
        ModLogger.debug("Adding Production data for player", { playerId: playerLibrary.id });
        const production = playerLibrary.Stats?.getNetYield(YieldTypes.YIELD_PRODUCTION);
        data.push({
          type: 'default',
          label: Locale.compose("LOC_YIELD_PRODUCTION"),
          value: `+${Math.floor(production)}`,
          img: `<img src='${UI.getIconURL("YIELD_PRODUCTION")}'>`,
          details: '',
          rawValue: production,
          warningThreshold: Infinity
        },);
      } catch (e) {
        ModLogger.debug("Production render failed", { error: String(e), playerId });
      }
    }

    // -------------------------
    // Population
    // -------------------------
    if (!showPopulation) {
      ModLogger.debug("Skipping Population due to briOptions", { ShowPopulation: BriOptions.ShowPopulation });
    } else {
      try {
        ModLogger.debug("Adding Population data for player", { playerId: playerLibrary.id });
        let specialists = 0;
        let urbanPopulation = 0;
        let ruralPopulation = 0;
        const cities = playerLibrary.Cities.getCities();
        for (const city of cities) {
          specialists += city.Workers.getNumWorkers(false) ?? 0;
          urbanPopulation += city.urbanPopulation ?? 0;
          ruralPopulation += city.ruralPopulation ?? 0;
        }
        const totalPop = urbanPopulation + ruralPopulation + specialists;

        data.push({
          type: 'default',
          label: Locale.compose("LOC_UI_CITY_BANNER_POPULATION_INFO", `${urbanPopulation}`, `${ruralPopulation}`, `${specialists}`),
          value: totalPop,
          //img: `<img src='${UI.getIconURL("CITY_CITIZENS_HI")}'>`,
          img: `<img src='${UI.getIconURL("CITY_CITIZENS_LIST")}'>`,
          details: "",
          rawValue: totalPop,
          warningThreshold: Infinity,
        },);
      } catch (e) {
        ModLogger.debug("Population render failed", { error: String(e), playerId });
      }
    }

    // -------------------------
    // Combat Power
    // -------------------------
    if (!showCombatPower) {
      ModLogger.debug("Skipping Combat Power due to briOptions", { ShowCombatPower: BriOptions.ShowCombatPower });
    } else {
      try {
        ModLogger.debug("Adding Combat Power data for player", { playerId: playerLibrary.id });
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
          //img: `<img src='${UI.getIconURL("DIPLOMACY_DECLARE_FORMAL_WAR_ICON")}'>`,
          img: `<img src='${UI.getIconURL("NAR_REW_COMBAT")}'>`,
          details: "Combat Power",
          rawValue: Math.ceil(production * 0.6 + combatPower * 1),
          warningThreshold: Infinity,
        },);
      } catch (e) {
        ModLogger.debug("Combat Power render failed", { error: String(e), playerId });
      }
    }

    return data;
  }
  DiploRibbonData.updateAll();
}, 100);
