import '/core/ui/options/options.js';
import { CategoryType, Options, OptionType } from '/core/ui/options/model-options.js';
import BriGlobals from '../../helpers/bri-globals.js';
// set up mod options tab
import ModOptions from './mod-options.js';
import ModLogger from '../../helpers/mod-logger.js';

class BriOptions {
    modID = BriGlobals.modId;
    defaults = {
        ShowProduction: Number(true),
        ShowPopulation: Number(true),
        ShowCombatPower: Number(true),
        ShowFood: Number(true),
    };
    data = {};
    load(optionID) {
        const value = ModOptions.load(this.modID, optionID);
        if (value == null) {
            const value = this.defaults[optionID];
            console.warn(`${this.modID}: LOAD ${this.modID}.${optionID}=${value} (default)`);
            return value;
        }
        return value;
    }
    save(optionID) {
        const value = this.data[optionID];

        // numbers / booleans for checkboxes
        if (typeof value === "boolean") {
            ModOptions.save(this.modID, optionID, Number(value));
            return;
        }

        // objects/arrays/strings (JSON-safe)
        ModOptions.save(this.modID, optionID, value);
    }
    get ShowProduction() {
        this.data.ShowProduction ??= Boolean(this.load("ShowProduction"));
        return this.data.ShowProduction;
    }
    set ShowProduction(value) {
        this.data.ShowProduction = Boolean(value);
        this.save("ShowProduction");
    }
    get ShowPopulation() {
        this.data.ShowPopulation ??= Boolean(this.load("ShowPopulation"));
        return this.data.ShowPopulation;
    }
    set ShowPopulation(value) {
        this.data.ShowPopulation = Boolean(value);
        this.save("ShowPopulation");
    }
    get ShowCombatPower() {
        this.data.ShowCombatPower ??= Boolean(this.load("ShowCombatPower"));
        return this.data.ShowCombatPower;
    }
    set ShowCombatPower(value) {
        this.data.ShowCombatPower = Boolean(value);
        this.save("ShowCombatPower");
    }
    get ShowFood() {
        this.data.ShowFood ??= Boolean(this.load("ShowFood"));
        return this.data.ShowFood;
    }
    set ShowFood(value) {
        this.data.ShowFood = Boolean(value);
        this.save("ShowFood");
    }
};

const briOptions = new BriOptions();

export { briOptions as default };

// log stored values
briOptions.ShowProduction;
briOptions.ShowPopulation;
briOptions.ShowCombatPower;
briOptions.ShowFood;

Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-production",
        initListener: (info) => info.currentValue = briOptions.ShowProduction,
        updateListener: (_info, value) => briOptions.ShowProduction = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_PRODUCTION_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_PRODUCTION_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-population",
        initListener: (info) => info.currentValue = briOptions.ShowPopulation,
        updateListener: (_info, value) => briOptions.ShowPopulation = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_POPULATION_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_POPULATION_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-combat-power",
        initListener: (info) => info.currentValue = briOptions.ShowCombatPower,
        updateListener: (_info, value) => briOptions.ShowCombatPower = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_COMBAT_POWER_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_COMBAT_POWER_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-food",
        initListener: (info) => info.currentValue = briOptions.ShowFood,
        updateListener: (_info, value) => briOptions.ShowFood = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_FOOD_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_FOOD_DESC",
    });
});

ModLogger.configure({
    prefix: briOptions.modID,
    minLevel: ModLogger.Levels.Error,
    sink: "warn",
    includeFunction: true,
    includeLocation: true,
    shortLocation: true,
    functionPlacement: "prefix",
    locationPlacement: "suffix",
});

ModLogger.forceInfo("ModLogger configured", {
    minLevel: ModLogger._cfg?.minLevel, // ok if this is undefined; just informational
    sink: ModLogger._cfg?.sink,
});
