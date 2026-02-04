import BriGlobals from "./bri-globals.js";

class ModLoggerSingleton {
  constructor() {
    this.Levels = {
      Verbose: 0,
      Debug: 1,
      Information: 2,
      Warning: 3,
      Error: 4,
      Fatal: 5,
    };

    this._cfg = {
      enabled: true,
      minLevel: this.Levels.Error,
      prefix: BriGlobals?.modId || null,
      sink: 'warn',
      maxLineLen: 900,          // max characters per log line (UILog truncation-safe)
      chunkLargeLogs: true,      // auto-chunk when exceeded
      chunkSize: 600,           // chunk size for payload splitting
      chunkField: 'data',        // "data" | "message" | "both"
      includeFunction: true,
      functionPlacement: 'prefix', // 'prefix' | 'suffix'
      includeLocation: true,
      shortLocation: true, // true = file.js:line | false = full fs://.../file.js:line
      locationPlacement: 'suffix', // 'prefix' | 'suffix'
      // Filtering (optional): allow only certain sources through
      // Examples:
      // allowFiles: [/diplo-ribbon\.js$/i],
      // allowFunctions: [/KillTracker/i, /onUnitKilledInCombat/i],
      allowFiles: null,      // array of strings or regex
      allowFunctions: null,  // array of strings or regex
      denyFiles: null,       // array of strings or regex
      denyFunctions: null,   // array of strings or regex
    };
  }

  configure(cfg = {}) {
    this._cfg = { ...this._cfg, ...cfg };
  }

  verbose(msg, data) { this._write(0, 'VERBOSE', msg, data); }
  debug(msg, data) { this._write(1, 'DEBUG', msg, data); }
  info(msg, data) { this._write(2, 'INFO', msg, data); }
  warn(msg, data) { this._write(3, 'WARN', msg, data); }
  error(msg, data) { this._write(4, 'ERROR', msg, data); }
  fatal(msg, data) { this._write(5, 'FATAL', msg, data); }

  Verbose(msg, data) { this._write(0, 'VERBOSE', msg, data); }
  Debug(msg, data) { this._write(1, 'DEBUG', msg, data); }
  Info(msg, data) { this._write(2, 'INFO', msg, data); }
  Warn(msg, data) { this._write(3, 'WARN', msg, data); }
  Error(msg, data) { this._write(4, 'ERROR', msg, data); }
  Fatal(msg, data) { this._write(5, 'FATAL', msg, data); }

  forceVerbose(msg, data) { this._write(0, 'VERBOSE', msg, data, { force: true }); }
  forceDebug(msg, data) { this._write(1, 'DEBUG', msg, data, { force: true }); }
  forceInfo(msg, data) { this._write(2, 'INFO', msg, data, { force: true }); }
  forceWarn(msg, data) { this._write(3, 'WARN', msg, data, { force: true }); }
  forceError(msg, data) { this._write(4, 'ERROR', msg, data, { force: true }); }
  forceFatal(msg, data) { this._write(5, 'FATAL', msg, data, { force: true }); }

  ForceVerbose(msg, data) { this._write(0, 'VERBOSE', msg, data, { force: true }); }
  ForceDebug(msg, data) { this._write(1, 'DEBUG', msg, data, { force: true }); }
  ForceInfo(msg, data) { this._write(2, 'INFO', msg, data, { force: true }); }
  ForceWarn(msg, data) { this._write(3, 'WARN', msg, data, { force: true }); }
  ForceError(msg, data) { this._write(4, 'ERROR', msg, data, { force: true }); }
  ForceFatal(msg, data) { this._write(5, 'FATAL', msg, data, { force: true }); }

  _allowed(level) {
    return this._cfg.enabled && level >= this._cfg.minLevel;
  }

  _sinkFn() {
    switch (this._cfg.sink) {
      case 'error': return console.error.bind(console);
      case 'warn': return console.warn.bind(console);
      default: return console.log.bind(console);
    }
  }

  safeStringify(value, maxLen = 4000) {
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
      return json.length > maxLen ? json.slice(0, maxLen) + "...(truncated)" : json;
    } catch {
      return String(value);
    }
  }

  _getCallerFrame() {
    const stack = String(new Error().stack || "");
    if (!stack) return "";

    const lines = stack.split("\n").map(s => s.trim()).filter(Boolean);

    // First frame that isn't ModLogger itself
    const frame = lines.find(l =>
      l.startsWith("at ") &&
      !l.includes("/helpers/mod-logger.js") &&
      !l.includes("ModLogger.") &&
      !l.includes("._write") &&
      !l.includes("._getCaller") &&
      !l.includes("Function.")
    );

    return frame || "";
  }

  _getCallerLocationFull() {
    const frame = this._getCallerFrame();
    if (!frame) return "";

    const m =
      frame.match(/\((fs:\/\/.*?):(\d+):(\d+)\)$/) ||
      frame.match(/at (fs:\/\/.*?):(\d+):(\d+)$/);

    if (!m) return "";

    const file = m[1];
    const line = m[2];
    const col = m[3];
    return `${file}:${line}:${col}`;
  }

  _getCallerLocation() {
    const frame = this._getCallerFrame();
    if (!frame) return "";

    const m =
      frame.match(/\((fs:\/\/.*?):(\d+):(\d+)\)$/) ||
      frame.match(/at (fs:\/\/.*?):(\d+):(\d+)$/);

    if (!m) return "";

    const file = m[1];
    const line = m[2];
    const col = m[3];

    if (this._cfg.shortLocation) {
      return `${file.split("/").pop()}:${line}:${col}`;
    }

    return `${file}:${line}:${col}`;
  }

  _getCallerFunction() {
    const frame = this._getCallerFrame();
    if (!frame) return "";

    const m = frame.match(/^at\s+([^\s(]+)/);
    if (!m) return "";

    const token = m[1];

    // If the "function" token is actually a location (happens when stack has no fn name), ignore it.
    // Examples: fs://.../file.js:116:11 or http(s)://... or file paths ending in :line:col
    if (
      token.startsWith("fs://") ||
      token.startsWith("http://") ||
      token.startsWith("https://") ||
      /:\d+:\d+$/.test(token)
    ) {
      return "";
    }

    return token; // function or Class.method
  }

  _matchAny(rules, value) {
    if (!rules || rules.length === 0) return false;
    const s = String(value || "");
    return rules.some(r => {
      if (!r) return false;
      if (r instanceof RegExp) return r.test(s);
      return String(r).toLowerCase() === s.toLowerCase();
    });
  }

  _passesFilters(fnName, loc) {
    const { allowFiles, allowFunctions, denyFiles, denyFunctions } = this._cfg;

    const file = String(loc || "").split(":")[0];

    // deny beats everything
    if (this._matchAny(denyFunctions, fnName)) return false;
    if (this._matchAny(denyFiles, file)) return false;


    // if no allow filters, allow all (subject to deny)
    const hasAllow =
      (allowFiles && allowFiles.length) ||
      (allowFunctions && allowFunctions.length);

    if (!hasAllow) return true;

    if (this._matchAny(allowFunctions, fnName)) return true;
    if (this._matchAny(allowFiles, file)) return true;

    return false;
  }

  _filtersConfigured() {
    const { allowFiles, allowFunctions, denyFiles, denyFunctions } = this._cfg;
    return !!(
      (allowFiles && allowFiles.length) ||
      (allowFunctions && allowFunctions.length) ||
      (denyFiles && denyFiles.length) ||
      (denyFunctions && denyFunctions.length)
    );
  }

  _inferPrefixFromLocation(loc) {
    const m = String(loc || "").match(/^fs:\/\/game\/([^/]+)\//i);
    return m ? m[1] : "";
  }

  _estimateLen(s) {
    return (s == null) ? 0 : String(s).length;
  }

  _chunkString(s, chunkSize) {
    const str = String(s ?? "");
    if (!str) return [""];
    const out = [];
    for (let i = 0; i < str.length; i += chunkSize) {
      out.push(str.slice(i, i + chunkSize));
    }
    return out;
  }

  _emitLine(sink, line) {
    sink(line);
  }

  _emitChunked(sink, baseLeft, baseRight, payloadLabel, payloadStr) {
    const chunkSize = Math.max(200, Number(this._cfg.chunkSize) || 1800);
    const parts = this._chunkString(payloadStr, chunkSize);
    const total = parts.length;

    // header line (optional but useful)
    this._emitLine(
      sink,
      `${baseLeft}|${payloadLabel} chunked|parts=${total}|chunkSize=${chunkSize}${baseRight}`
    );

    for (let i = 0; i < total; i++) {
      const part = parts[i];
      this._emitLine(
        sink,
        `${baseLeft}|${payloadLabel}[${i + 1}/${total}]=${part}${baseRight}`
      );
    }
  }

  _write(level, label, message, data, { force = false } = {}) {
    const fnName = this._cfg.includeFunction ? (this._getCallerFunction() || "") : "";
    const loc = this._cfg.includeLocation ? (this._getCallerLocation() || "") : "";

    if (!force) {
      const levelAllowed = this._allowed(level); // includes enabled + minLevel
      const filtersConfigured = this._filtersConfigured();
      const passedFilters = filtersConfigured ? this._passesFilters(fnName, loc) : true;

      // Rules:
      // - fail filters => never write
      if (!passedFilters) return;

      // - no filters configured => must be allowed
      if (!filtersConfigured && !levelAllowed) return;

      // - filters configured + passed => write (even if !levelAllowed)
    }

    if (!this._cfg.prefix) {
      const inferred = this._inferPrefixFromLocation(this._getCallerLocationFull());
      if (inferred) this._cfg.prefix = inferred;
    }

    const prefix = this._cfg.prefix ? `|${this._cfg.prefix}` : "|";

    const fnToken = fnName ? `|${fnName}` : "|";
    const locToken = loc ? `|${loc}` : "|";

    // build prefix tokens (order: function then location)
    const prefixTokens = [];
    if (fnToken && this._cfg.functionPlacement === "prefix") prefixTokens.push(fnToken);
    if (locToken && this._cfg.locationPlacement === "prefix") prefixTokens.push(locToken);

    // build suffix tokens (order: function then location)
    const suffixTokens = [];
    if (fnToken && this._cfg.functionPlacement === "suffix") suffixTokens.push(fnToken);
    if (locToken && this._cfg.locationPlacement === "suffix") suffixTokens.push(locToken);

    const left = prefixTokens.length ? `${prefixTokens.join("|")}` : "|";
    const right = suffixTokens.length ? `${suffixTokens.join("|")}` : "|";

    const sink = this._sinkFn();

    const baseLeft = `${label}${prefix}${left}|${message}`;
    const baseRight = right;

    // Decide if we should chunk
    const maxLineLen = Math.max(0, Number(this._cfg.maxLineLen) || 0);
    const shouldChunk = !!this._cfg.chunkLargeLogs && maxLineLen > 0;

    // Build data string once (even if we chunk)
    let dataStr = null;
    if (data !== undefined && data !== null) {
      dataStr = this.safeStringify(data, 200000); // big cap; logger handles chunking now
    }

    if (!shouldChunk) {
      let line = baseLeft;
      if (dataStr != null) line += `|data=${dataStr}`;
      line += baseRight;
      sink(line);
      return;
    }

    // If no data and message isn't huge, emit normally
    const baseLen = this._estimateLen(baseLeft) + this._estimateLen(baseRight);
    const dataLen = dataStr != null ? this._estimateLen(`|data=${dataStr}`) : 0;
    const totalLen = baseLen + dataLen;

    if (totalLen <= maxLineLen) {
      let line = baseLeft;
      if (dataStr != null) line += `|data=${dataStr}`;
      line += baseRight;
      sink(line);
      return;
    }

    // Chunking rules
    const chunkField = String(this._cfg.chunkField || "data").toLowerCase();

    // 1) Prefer chunking data (most common)
    if (dataStr != null && (chunkField === "data" || chunkField === "both")) {
      this._emitChunked(sink, `${label}${prefix}${left}|${message}`, baseRight, "data", dataStr);
      return;
    }

    // 2) If no data or you want message chunking
    if (chunkField === "message" || chunkField === "both") {
      // chunk the message itself (rare). We keep label/prefix/left and split message text.
      const parts = this._chunkString(String(message ?? ""), Math.max(200, Number(this._cfg.chunkSize) || 1800));
      const total = parts.length;

      this._emitLine(sink, `${label}${prefix}${left}|message chunked|parts=${total}${baseRight}`);
      for (let i = 0; i < total; i++) {
        let line = `${label}${prefix}${left}|msg[${i + 1}/${total}]=${parts[i]}`;
        if (dataStr != null) line += `|data=${dataStr}`;
        line += baseRight;
        sink(line);
      }
      return;
    }

    // Fallback: if configuration is weird, emit truncated single line
    let line = baseLeft;
    if (dataStr != null) line += `|data=${dataStr}`;
    line += baseRight;

    sink(line);
  }
}

const ModLogger = new ModLoggerSingleton();

// Expose globally (this is the key for Civ7 UIScripts)
//globalThis.ModLogger = ModLogger;

ModLogger.forceInfo("ModLogger registered");

export default ModLogger;
