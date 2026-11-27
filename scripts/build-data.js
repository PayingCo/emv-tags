// Regenerates src/data.js from the Paying.co tools dictionary.
// Usage: node scripts/build-data.js path/to/emv-data.js
const fs = require('fs'), vm = require('vm');
const src = fs.readFileSync(process.argv[2], 'utf8').replace(/^const /gm, 'var ');
const ctx = {}; vm.createContext(ctx); vm.runInContext(src, ctx);
const out = { tags: ctx.EMV_TAGS, bitDecoders: ctx.BIT_DECODERS, rids: ctx.RID_REGISTRY, aids: ctx.KNOWN_AIDS };
fs.mkdirSync('src', { recursive: true });
fs.writeFileSync('src/data.json', JSON.stringify(out, null, 1) + '\n');
console.log(Object.keys(out.tags).length + ' tags, ' + Object.keys(out.aids).length + ' AIDs');
