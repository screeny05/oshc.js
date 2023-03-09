import React, { useEffect, useState } from 'react';
import parseDataFile, { IndexFileEntry } from '../../../sprites/data-parser';
import loadSpritesheetData, {
  getCachedSpritesheetData,
  useIndexFile,
} from '../../../sprites/data-loader';
import { modifySprite } from '../../../sprites/modify-sprite';

interface SpritesheetProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  spritesheet: string;
  index?: number;
  maskIndex?: number;
  maskColor?: 'magenta' | 'black';
  usesAA?: boolean;
}

const imageCache: Map<string, string> = new Map();
const useImageModification = (
  spritesheet: string,
  index: number = -1,
  indexEntry: IndexFileEntry | undefined,
  cacheSuffix: string,
  fn: (data: Uint8ClampedArray) => void,
  hookGuard: () => boolean = () => true
): string | undefined => {
  const cacheId = `${spritesheet}/${index}:${!!indexEntry}:${cacheSuffix}`;
  const [modified, setModified] = useState(imageCache.get(cacheId));

  useEffect(() => {
    if (!indexEntry || !hookGuard()) {
      return;
    }

    if (imageCache.has(cacheId)) {
      setModified(imageCache.get(cacheId)!);
      return;
    }

    modifySprite(spritesheet, indexEntry, fn).then((url) => {
      imageCache.set(cacheId, url);
      setModified(url);
    });
  }, [cacheId]);

  return modified;
};

const useMask = (
  spritesheet: string,
  index: number | undefined,
  maskIndexEntry: IndexFileEntry | undefined,
  maskColor: 'magenta' | 'black'
): string | undefined => {
  return useImageModification(
    spritesheet,
    index,
    maskIndexEntry,
    'mask',
    (data) => {
      for (var i = 0; i < data.length; i += 4) {
        if (maskColor === 'black') {
          data[i + 3] = data[i];
          data[i] = data[i + 1] = data[i + 2] = 255;
        }
        if (maskColor === 'magenta') {
          data[i + 3] = data[i + 1];
          data[i + 1] = data[i];
        }
      }
    }
  );
};

const useAntialiased = (
  usesAA: boolean,
  spritesheet: string,
  index: number | undefined,
  indexEntry: IndexFileEntry | undefined
): string | undefined => {
  return useImageModification(
    spritesheet,
    index,
    indexEntry,
    'antialiased',
    (data) => {
      for (var i = 0; i < data.length; i += 4) {
        data[i + 3] = data[i + 1];
        data[i + 1] = data[i];
      }
    },
    () => usesAA
  );
};

export default function Spritesheet({
  spritesheet,
  index,
  maskIndex,
  maskColor = 'black',
  usesAA,
  style,
  ...props
}: SpritesheetProps) {
  const filePrefix = `/orgx/gm/${spritesheet}`;
  const indexEntries = useIndexFile(spritesheet);
  const indexEntry = indexEntries?.[index ?? -1];
  const maskIndexEntry = indexEntries?.[maskIndex ?? -1];

  if (
    indexEntries &&
    ((index && !indexEntry) || (maskIndex && !maskIndexEntry))
  ) {
    console.warn(
      `Spritesheet ${spritesheet} does not contain index ${index}. Index contains ${indexEntries.length} entries.`
    );
  }

  const maskImage = useMask(spritesheet, maskIndex, maskIndexEntry, maskColor);

  // TODO should be done for the whole spritesheet, not just a single entry
  const antialiasedImage = useAntialiased(
    !!usesAA,
    spritesheet,
    index,
    indexEntry
  );

  if (
    (typeof index !== 'undefined' && !indexEntry) ||
    (typeof maskIndex !== 'undefined' && !maskIndexEntry)
  ) {
    // Preload image while we wait for index
    return <img src={`${filePrefix}.png`} style={{ display: 'none' }} />;
  }

  if (antialiasedImage && indexEntry) {
    return (
      <div
        style={{
          ...style,
          backgroundImage: `url('${antialiasedImage}')`,
          backgroundRepeat: 'no-repeat',
          maskImage: maskImage ? `url('${maskImage}')` : '',
          width: indexEntry.w,
          height: indexEntry.h,
          imageRendering: 'pixelated',
        }}
        {...props}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        ...(indexEntry
          ? {
              backgroundImage: `url('${filePrefix}.png')`,
              backgroundRepeat: 'no-repeat',
              backgroundPositionX: -indexEntry.x,
              backgroundPositionY: -indexEntry.y,
            }
          : {}),
        maskImage: maskImage ? `url('${maskImage}')` : '',
        width: maskIndexEntry ? maskIndexEntry.w : indexEntry!.w,
        height: maskIndexEntry ? maskIndexEntry.h : indexEntry!.h,
        imageRendering: 'pixelated',
      }}
      {...props}
    />
  );
}
