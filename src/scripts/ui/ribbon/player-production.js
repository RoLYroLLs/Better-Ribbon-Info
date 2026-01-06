import { D as DiploRibbonData } from '/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js'
import briOptions from '../options/bri-options.js';

setTimeout(() => {
  const prototype = Object.getPrototypeOf(DiploRibbonData);
  const createPlayerYieldsData = prototype.createPlayerYieldsData;
  prototype.createPlayerYieldsData = function (playerLibrary, isLocal) {
    const data = createPlayerYieldsData.call(this, playerLibrary, isLocal);

    if (briOptions.ShowProduction === false) {
      console.info(`Skipping Production due to briOptions.ShowProduction: (${briOptions.ShowProduction})`);
      return data;
    }

    /* Add Production Info */
    const production = playerLibrary.Stats?.getNetYield(YieldTypes.YIELD_PRODUCTION);
    data.push({
      type: 'default',
      label: Locale.compose("LOC_YIELD_PRODUCTION"),
      value: `+${Math.floor(production)}`,
      img: `<img src='${UI.getIconURL("YIELD_PRODUCTION")}'>`,
      details: '',
      rawValue: production,
      warningThreshold: Infinity
    },)

    /* End Additions */
    return data;
  }
  DiploRibbonData.updateAll();
}, 100);
