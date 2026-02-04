import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
import BriGlobals from '../../helpers/bri-globals.js';
// set up mod options tab
import ModOptions from './mod-options.js';
import ModLogger from '../../helpers/mod-logger.js';

const BriOptions = new class {
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

// log stored values
BriOptions.ShowProduction;
BriOptions.ShowPopulation;
BriOptions.ShowCombatPower;
BriOptions.ShowFood;

Options.addInitCallback(() => {
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-production",
        initListener: (info) => info.currentValue = BriOptions.ShowProduction,
        updateListener: (_info, value) => BriOptions.ShowProduction = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_PRODUCTION_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_PRODUCTION_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-population",
        initListener: (info) => info.currentValue = BriOptions.ShowPopulation,
        updateListener: (_info, value) => BriOptions.ShowPopulation = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_POPULATION_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_POPULATION_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-combat-power",
        initListener: (info) => info.currentValue = BriOptions.ShowCombatPower,
        updateListener: (_info, value) => BriOptions.ShowCombatPower = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_COMBAT_POWER_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_COMBAT_POWER_DESC",
    });
    Options.addOption({
        category: CategoryType.Mods,
        group: "BRI_MOD",
        type: OptionType.Checkbox,
        id: "bri-yields-food",
        initListener: (info) => info.currentValue = BriOptions.ShowFood,
        updateListener: (_info, value) => BriOptions.ShowFood = value,
        label: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_FOOD_NAME",
        description: "LOC_MOD_BETTER_RIBBON_INFO_OPTION_FOOD_DESC",
    });
});

ModLogger.configure({
    prefix: BriOptions.modID,
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

export { BriOptions as default };
