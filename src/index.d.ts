export interface TagInfo { tag: string; name: string; ascii?: boolean; constructed?: boolean; }
export interface TlvNode { tag: string; name: string; length: number; value: string; children?: TlvNode[]; }
export interface AidInfo { aid: string; scheme?: string; region?: string; product?: string; }
export function lookupTag(tag: string): TagInfo | undefined;
export function searchTags(query: string): TagInfo[];
export function parseTlv(hex: string): TlvNode[];
export function decodeBits(name: string, hex: string): string[];
export function lookupAid(aid: string): AidInfo | undefined;
export const tags: Record<string, { name: string; ascii?: boolean; constructed?: boolean }>;
export const bitDecoders: string[];
