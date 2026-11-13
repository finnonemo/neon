// A zip archive of a directory, written with node:zlib alone so finno keeps no dependencies.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';

async function filesUnder(directory, prefix = '') {
  const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => (a.name < b.name ? -1 : 1));
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesUnder(join(directory, entry.name), `${prefix}${entry.name}/`)
    : [{ name: `${prefix}${entry.name}`, path: join(directory, entry.name) }]));
  return nested.flat();
}

/** The bytes of a zip that holds every file under `directory`, at paths relative to it. */
export async function zipDirectory(directory) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const { name, path } of await filesUnder(directory)) {
    const content = await readFile(path);
    const packed = deflateRawSync(content);
    const nameBytes = Buffer.from(name);
    const shared = Buffer.alloc(26);
    shared.writeUInt16LE(20, 0); // version needed
    shared.writeUInt16LE(0x0800, 2); // names are UTF-8
    shared.writeUInt16LE(8, 4); // deflate
    shared.writeUInt32LE(0x00210000, 6); // 1980-01-01, so the same files give the same archive
    shared.writeUInt32LE(crc32(content), 10);
    shared.writeUInt32LE(packed.length, 14);
    shared.writeUInt32LE(content.length, 18);
    shared.writeUInt16LE(nameBytes.length, 22);
    const local = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), shared, nameBytes, packed]);
    const tail = Buffer.alloc(14); // comment length, disk, attributes, then where the entry starts
    tail.writeUInt32LE(offset, 10);
    central.push(Buffer.concat([Buffer.from([0x50, 0x4b, 0x01, 0x02, 20, 0]), shared, tail, nameBytes]));
    locals.push(local);
    offset += local.length;
  }
  const directoryBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(central.length, 8);
  end.writeUInt16LE(central.length, 10);
  end.writeUInt32LE(directoryBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directoryBytes, end]);
}
