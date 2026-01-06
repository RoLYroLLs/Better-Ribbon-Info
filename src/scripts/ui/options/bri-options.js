import '/core/ui/options/screen-options.js';  // make sure this loads first
import { C as CategoryType, O as Options, a as OptionType } from '/core/ui/options/editors/index.chunk.js';
// set up mod options tab
import ModOptions from './mod-options.js';

const briOptions = new class {
    modID = "better-ribbon-info";
    defaults = {
        ShowProduction: Number(true),
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
};

// log stored values
briOptions.ShowProduction;

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
});

export { briOptions as default };
