var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/nanoid@4.0.2/node_modules/nanoid/index.js
var nanoid_exports = {};
__export(nanoid_exports, {
  customAlphabet: () => customAlphabet,
  customRandom: () => customRandom,
  nanoid: () => nanoid,
  random: () => random,
  urlAlphabet: () => urlAlphabet
});
module.exports = __toCommonJS(nanoid_exports);
var import_crypto = require("crypto");

// node_modules/.pnpm/nanoid@4.0.2/node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// node_modules/.pnpm/nanoid@4.0.2/node_modules/nanoid/index.js
var POOL_SIZE_MULTIPLIER = 128;
var pool;
var poolOffset;
var fillPool = (bytes) => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    (0, import_crypto.randomFillSync)(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    (0, import_crypto.randomFillSync)(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
var random = (bytes) => {
  fillPool(bytes -= 0);
  return pool.subarray(poolOffset - bytes, poolOffset);
};
var customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << 31 - Math.clz32(alphabet.length - 1 | 1)) - 1;
  let step = Math.ceil(1.6 * mask * defaultSize / alphabet.length);
  return (size = defaultSize) => {
    let id = "";
    while (true) {
      let bytes = getRandom(step);
      let i = step;
      while (i--) {
        id += alphabet[bytes[i] & mask] || "";
        if (id.length === size)
          return id;
      }
    }
  };
};
var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);
var nanoid = (size = 21) => {
  fillPool(size -= 0);
  let id = "";
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id;
};
//# sourceMappingURL=nanoid.js.map
