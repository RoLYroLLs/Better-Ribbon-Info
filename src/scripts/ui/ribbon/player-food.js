import { D as DiploRibbonData } from '/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js'
import briOptions from '../options/bri-options.js';

setTimeout(() => {
  const prototype = Object.getPrototypeOf(DiploRibbonData);
  const createPlayerYieldsData = prototype.createPlayerYieldsData;
  prototype.createPlayerYieldsData = function (playerLibrary, isLocal) {
    const data = createPlayerYieldsData.call(this, playerLibrary, isLocal);

    try {
      if (briOptions.ShowFood === false) {
        console.warn(`${briOptions.modID}:Skipping Food due to briOptions.ShowFood: (${briOptions.ShowFood})`);
        return data;
      }

      /* Add Food Info */
      const food = playerLibrary.Stats?.getNetYield(YieldTypes.YIELD_FOOD);
      data.push({
        type: 'default',
        label: Locale.compose("LOC_YIELD_FOOD"),
        value: `+${Math.floor(food)}`,
        img: `<img src='${UI.getIconURL("YIELD_FOOD")}'>`,
        details: '',
        rawValue: food,
        warningThreshold: Infinity
      },)
    }
    catch (e) {
      console.error(`${briOptions.modID}: player-food error: ${e}`);
    }

    /* End Additions */
    return data;
  }
  DiploRibbonData.updateAll();
}, 100);
