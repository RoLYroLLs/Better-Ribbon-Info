import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
// set up mod options tab
import ModOptions from './mod-options.js';

const briOptions = new class {
    modID = "better-ribbon-info";
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
        const value = Number(this.data[optionID]);
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

export { briOptions as default };
