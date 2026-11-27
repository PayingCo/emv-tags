# emv-tags

EMV tag dictionary, BER-TLV parser, bit-flag decoders (AIP, TVR and more) and AID lookup. Zero dependencies, runs in Node and the browser.

Built and maintained by [Paying.co](https://paying.co), a payment engineering firm specializing in EMV Level 3 certification. The same data powers our free browser tools: [EMV tag lookup](https://paying.co/tools/emv-tag-lookup/), [TLV parser](https://paying.co/tools/emv-tlv-parser/) and [ISO 8583 decoder](https://paying.co/tools/iso8583-decoder/).

```
npm install emv-tags
```

```js
const emv = require('emv-tags');

emv.lookupTag('9F26');
// { tag: '9F26', name: 'Application Cryptogram (ARQC/TC/AAC)' }

emv.parseTlv('6F0F8407A0000000031010A50450024142');
// [{ tag: '6F', name: 'File Control Information (FCI) Template', children: [...] }]

emv.decodeBits('AIP', '5C00');
// ['SDA supported', 'Cardholder verification supported', ...]

emv.lookupAid('A0000000031010');
// { scheme: 'Visa', region: 'International', product: 'Visa Credit/Debit (classic)' }

emv.searchTags('cryptogram');
```

## API

| Function | Returns |
| --- | --- |
| lookupTag(tag) | Tag name and flags, or undefined |
| searchTags(query) | Tags whose number or name matches |
| parseTlv(hex) | Tree of nodes with tag, name, length, value, children. Throws on malformed data |
| decodeBits(name, hex) | List of set flags for a bit-mapped value |
| lookupAid(aid) | Scheme, region and product for an AID |

## Notes

The dictionary covers the EMVCo Book 1 to 4 tags and common contactless kernel and scheme tags. Tag meanings can differ by kernel and scheme, so confirm against the specification for your certification target. Do not paste live card data into any tool.

## Related guides

[Field 55 EMV data in ISO 8583](https://paying.co/iso-8583/field-55-emv-data/) · [EMV Level 3 certification](https://paying.co/emv-certification/)

## License

MIT. Issues and tag additions welcome.
