import { D as DiploRibbonData } from '/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js'
import briOptions from '../options/bri-options.js';

setTimeout(() => {
  const prototype = Object.getPrototypeOf(DiploRibbonData);
  const createPlayerYieldsData = prototype.createPlayerYieldsData;
  prototype.createPlayerYieldsData = function (playerLibrary, isLocal) {
    const data = createPlayerYieldsData.call(this, playerLibrary, isLocal);

    try {
      if (briOptions.ShowPopulation === false) {
        console.warn(`${briOptions.modID}:Skipping Population due to briOptions.ShowPopulation: (${briOptions.ShowPopulation})`);
        return data;
      }

      /* Add Population Info */
      let specialists = 0;
      let urbanPopulation = 0;
      let ruralPopulation = 0;
      const cities = playerLibrary.Cities.getCities();
      for (const city of cities) {
        specialists += city.Workers.getNumWorkers(false) ?? 0;
        urbanPopulation += city.urbanPopulation ?? 0;
        ruralPopulation += city.ruralPopulation ?? 0;
      }

      data.push({
        type: 'default',
        label: Locale.compose("LOC_UI_CITY_BANNER_POPULATION_INFO", `${urbanPopulation}`, `${ruralPopulation}`, `${specialists}`),
        value: urbanPopulation + ruralPopulation + specialists,
        img: `<img src='${UI.getIconURL("CITY_CITIZENS_HI")}'>`,
        details: "",
        rawValue: urbanPopulation + ruralPopulation + specialists,
        warningThreshold: Infinity,
      },)
    }
    catch (e) {
      console.error(`${briOptions.modID}: player-population error: ${e}`);
    }

    /* End Additions */
    return data;
  }
  DiploRibbonData.updateAll();
}, 100);
