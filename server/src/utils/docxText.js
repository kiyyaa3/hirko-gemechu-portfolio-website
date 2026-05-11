import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const cache = new Map();

export async function extractDocxText(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const fileStat = await stat(absolutePath);
    const cached = cache.get(absolutePath);

    if (cached?.mtimeMs === fileStat.mtimeMs) {
      return cached.text;
    }

    const buffer = await readFile(absolutePath);
    const entries = readZipEntries(buffer);
    const documentParts = entries
      .filter((entry) => /^word\/(document|header\d+|footer\d+)\.xml$/.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    const text = documentParts
      .map((entry) => xmlToText(readZipEntry(buffer, entry)))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    cache.set(absolutePath, { mtimeMs: fileStat.mtimeMs, text });
    return text;
  } catch (error) {
    console.warn("CV text extraction skipped:", error.message);
    return "";
  }
}

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) return [];

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const end = centralDirectoryOffset + centralDirectorySize;
  const entries = [];

  for (let offset = centralDirectoryOffset; offset < end;) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    entries.push({ name, compressionMethod, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntry(buffer, entry) {
  const offset = entry.localHeaderOffset;
  if (buffer.readUInt32LE(offset) !== 0x04034b50) return "";

  const fileNameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + fileNameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return compressed.toString("utf8");
  }

  if (entry.compressionMethod === 8) {
    return zlib.inflateRawSync(compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString("utf8");
  }

  return "";
}

function findEndOfCentralDirectory(buffer) {
  const minimumOffset = Math.max(0, buffer.length - 0xffff - 22);
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

function xmlToText(xml) {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<\/w:tc>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
