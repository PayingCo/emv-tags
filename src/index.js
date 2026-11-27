'use strict';
const data = require('./data.json');

function clean(hex) { return String(hex || '').replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '').toUpperCase(); }

/** Look up a tag, for example lookupTag('9F26'). Returns undefined if unknown. */
function lookupTag(tag) {
  const t = clean(tag);
  const e = data.tags[t];
  return e ? Object.assign({ tag: t }, e) : undefined;
}

/** Search tags by tag number or name fragment. */
function searchTags(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  return Object.keys(data.tags)
    .filter((t) => t.toLowerCase().includes(q) || data.tags[t].name.toLowerCase().includes(q))
    .map((t) => Object.assign({ tag: t }, data.tags[t]));
}

/** Parse BER-TLV hex into a tree: [{ tag, name, length, value, children? }]. Throws on malformed input. */
function parseTlv(hex) {
  const h = clean(hex);
  if (h.length % 2) throw new Error('Hex string has an odd number of characters');
  const b = [];
  for (let i = 0; i < h.length; i += 2) b.push(parseInt(h.substr(i, 2), 16));
  return walk(b, 0, b.length);
}

function toHex(bytes) { return bytes.map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join(''); }

function walk(b, start, end) {
  const out = [];
  let i = start;
  while (i < end) {
    if (b[i] === 0x00 || b[i] === 0xff) { i++; continue; } // padding
    const tagStart = i;
    const constructed = (b[i] & 0x20) !== 0;
    if ((b[i] & 0x1f) === 0x1f) { i++; while (i < end && (b[i] & 0x80)) i++; }
    i++;
    if (i > end) throw new Error('Truncated tag at byte ' + tagStart);
    const tag = toHex(b.slice(tagStart, i));
    if (i >= end) throw new Error('Missing length for tag ' + tag);
    let len = b[i++];
    if (len & 0x80) {
      const n = len & 0x7f;
      if (n < 1 || n > 3 || i + n > end) throw new Error('Bad length encoding for tag ' + tag);
      len = 0;
      for (let k = 0; k < n; k++) len = (len << 8) | b[i++];
    }
    if (i + len > end) throw new Error('Tag ' + tag + ' length ' + len + ' exceeds available data');
    const known = data.tags[tag];
    const node = { tag, name: known ? known.name : 'Unknown / proprietary tag', length: len, value: toHex(b.slice(i, i + len)) };
    if (constructed || (known && known.constructed)) node.children = walk(b, i, i + len);
    out.push(node);
    i += len;
  }
  return out;
}

/** Decode a bit-mapped value (AIP, TVR, TSI, CVMR and others) into its set flags. */
function decodeBits(name, hex) {
  const d = data.bitDecoders[String(name).toUpperCase()];
  if (!d) throw new Error('No bit decoder for ' + name + '. Available: ' + Object.keys(data.bitDecoders).join(', '));
  const h = clean(hex);
  if (h.length !== d.len * 2) throw new Error(name + ' must be ' + d.len + ' bytes');
  const bytes = []; for (let i = 0; i < h.length; i += 2) bytes.push(parseInt(h.substr(i, 2), 16));
  return d.bits.filter(([byte, bit]) => (bytes[byte] >> bit) & 1).map(([, , label]) => label);
}

/** Identify a card AID: { aid, scheme, region, product }. */
function lookupAid(aid) {
  const a = clean(aid);
  const rid = a.slice(0, 10);
  const r = data.rids[rid] || data.rids[a.slice(0, 14)];
  const product = Object.keys(data.aids).filter((k) => a.startsWith(k)).sort((x, y) => y.length - x.length)[0];
  if (!r && !product) return undefined;
  return { aid: a, scheme: r && r.scheme, region: r && r.region, product: product ? data.aids[product] : undefined };
}

module.exports = { lookupTag, searchTags, parseTlv, decodeBits, lookupAid, tags: data.tags, bitDecoders: Object.keys(data.bitDecoders) };
