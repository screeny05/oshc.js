import parseDataFile, { Gm1 } from './data-parser';
import { useEffect, useState } from 'react';

const indexCacheLoading: Map<string, Promise<Gm1>> = new Map();
const indexCacheLoaded: Map<string, Gm1> = new Map();

export default async function loadSpritesheetData(
  spritesheet: string
): Promise<Gm1> {
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

export function getCachedSpritesheetData(spritesheet: string): Gm1 | undefined {
  return indexCacheLoaded.get(spritesheet);
}

export const useGm1File = (
  spritesheet: string,
  callback?: (data: Gm1) => void
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
