import React, { useEffect, useState } from 'react';
import { extractSpriteFromSheet } from '../../../sprites/modify-sprite';

const useCursorImage = (id: number): string | undefined => {
  const [cursor, setCursor] = useState<string | undefined>();

  useEffect(() => {
    extractSpriteFromSheet('interface_icons3', id, true).then((url) =>
      setCursor(url)
    );
  }, []);

  return cursor;
};

const CURSORS = {
  default: 226,
  sword: 227,
} as const;

export default function Cursor() {
  const url = useCursorImage(CURSORS.default);
  return (
    <style>{`
      html {
        cursor: url('${url}'), auto;
        /* Retina ready pixelated cursor */
        cursor: -webkit-image-set(url('${url}') ${window.devicePixelRatio}x), auto;
        cursor: image-set(url('${url}') ${window.devicePixelRatio}x), auto;
      }
    `}</style>
  );
}
