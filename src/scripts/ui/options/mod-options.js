import { d as CategoryData, C as CategoryType } from '/core/ui/options/editors/index.chunk.js';
import ModLogger from '../../helpers/mod-logger.js';

CategoryType["Mods"] = "mods";
CategoryData[CategoryType.Mods] ??= {
    title: "LOC_UI_CONTENT_MGR_SUBTITLE",
    description: "LOC_UI_CONTENT_MGR_SUBTITLE_DESCRIPTION",
};

export class ModOptionsSingleton {
    static safeStringify(value, maxLen = 4000) {
        try {
            const seen = new WeakSet();
            const json = JSON.stringify(value, (k, v) => {
                if (typeof v === "object" && v !== null) {
                    if (seen.has(v)) return "[Circular]";
                    seen.add(v);
                }
                return v;
            });
            if (!json) return String(value);
            return json.length > maxLen ? json.slice(0, maxLen) + "…(truncated)" : json;
        } catch {
            return String(value);
        }
    }
    save(modID, optionID, value) {
        const optionName = `${modID}.${optionID}`;
        UI.setOption("user", "Mod", optionName, value);
        Configuration.getUser().saveCheckpoint();
        if (localStorage.length > 1) {
            ModLogger.info(`erasing storage (${localStorage.length} items)`);
            localStorage.clear();
        }
        const storage = localStorage.getItem("modSettings") || "{}";
        const options = JSON.parse(storage);
        options[modID] ??= {};
        options[modID][optionID] = value;
        localStorage.setItem("modSettings", JSON.stringify(options));
        ModLogger.info(`SAVE ${optionName}=${ModOptionsSingleton.safeStringify(value)}`);
    }
    load(modID, optionID) {
        const optionName = `${modID}.${optionID}`;
        const value = UI.getOption("user", "Mod", optionName);
        if (value != null) {
            ModLogger.info(`LOAD ${optionName}=${ModOptionsSingleton.safeStringify(value)} (saved)`);
            return value;
        }
        // const value = UI.getOption("user", "Mod", data.optionName);
        try {
            const storage = localStorage.getItem("modSettings");
            if (!storage) return null;
            const options = JSON.parse(storage);
            if (!options) return null;
            options[modID] ??= {};
            const value = options[modID][optionID];
            ModLogger.info(`LOAD ${optionName}=${ModOptionsSingleton.safeStringify(value)} (stored)`);
            return value;
        }
        catch (e) {
            ModLogger.error(`error loading options: ${e}`);
        }
        return null;
    }
}
const ModOptions = new ModOptionsSingleton();
export { ModOptions as default };
