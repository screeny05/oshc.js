import parseDataFile, { IndexFileEntry } from './data-parser';
import { useEffect, useState } from 'react';

const indexCacheLoading: Map<string, Promise<IndexFileEntry[]>> = new Map();
const indexCacheLoaded: Map<string, IndexFileEntry[]> = new Map();

export default async function loadSpritesheetData(
  spritesheet: string
): Promise<IndexFileEntry[]> {
  const cached = indexCacheLoading.get(spritesheet);
  if (cached) {
    return cached;
  }

  const fetched = (async () => {
    const res = await fetch(`/orgx/gm/${spritesheet}.data`);
    const data = await res.text();
    const parsed = parseDataFile(data);

    indexCacheLoaded.set(spritesheet, parsed);
    return parsed;
  })();

  indexCacheLoading.set(spritesheet, fetched);
  return fetched;
}

export function getCachedSpritesheetData(
  spritesheet: string
): IndexFileEntry[] | undefined {
  return indexCacheLoaded.get(spritesheet);
}

export const useIndexFile = (
  spritesheet: string,
  callback?: (data: IndexFileEntry[]) => void
) => {
  const [indexEntries, setIndexEntries] = useState(
    getCachedSpritesheetData(spritesheet)
  );

  useEffect(() => {
    loadSpritesheetData(spritesheet).then((data) => {
      setIndexEntries(data);
      callback?.(data);
    });
  }, [spritesheet]);
  return indexEntries;
};
