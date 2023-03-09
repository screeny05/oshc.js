import React, { useState } from 'react';
import { ReactNode } from 'react';
import {
  BorderImage,
  buildBorderImage,
} from '../../../sprites/border-image-builder';
import SpritesheetDebugger from '../SpritesheetDebugger';
import './index.css';

type BoxVariants = 'red-big' | 'red-small' | 'gold-big';

interface BoxProps {
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
  variant?: BoxVariants;
}

interface TextureMap {
  nw: number;
  nwMask?: number;
  n: number;
  nMask?: number;
  ne: number;
  neMask?: number;
  e: number;
  eMask?: number;
  se: number;
  seMask?: number;
  s: number;
  sMask?: number;
  sw: number;
  swMask?: number;
  w: number;
  wMask?: number;
  bg: number;
  bgMask?: number;
}

const TextureMaps: Record<BoxVariants, TextureMap> = {
  'red-big': {
    nw: 0,
    nwMask: 3,
    n: 1,
    nMask: 4,
    ne: 2,
    neMask: 5,
    e: 8,
    eMask: 11,
    se: 14,
    seMask: 17,
    s: 13,
    sMask: 16,
    sw: 12,
    swMask: 15,
    w: 6,
    wMask: 9,
    bg: 7,
    bgMask: 10,
  },
  'gold-big': {
    nw: 194,
    n: 195,
    ne: 196,
    w: 197,
    bg: 198,
    e: 199,
    sw: 200,
    s: 201,
    se: 202,
    nwMask: 3,
    nMask: 4,
    neMask: 5,
    eMask: 11,
    seMask: 17,
    sMask: 16,
    swMask: 15,
    wMask: 9,
    bgMask: 10,
  },
  'red-small': {
    nw: 47,
    n: 48,
    ne: 49,
    nwMask: 50,
    nMask: 51,
    neMask: 52,
    w: 53,
    bg: 54,
    e: 55,
    wMask: 56,
    bgMask: 57,
    eMask: 58,
    sw: 59,
    s: 60,
    se: 61,
    swMask: 62,
    sMask: 63,
    seMask: 64,
  },
};

export default function Box({
  children,
  variant = 'red-small',
  className = '',
  contentClassName = '',
}: BoxProps) {
  // return <SpritesheetDebugger spritesheet="interface_icons3" />;

  const map = TextureMaps[variant];
  const [borderImage, setBorderImage] = useState<BorderImage | undefined>();
  if (!borderImage) {
    buildBorderImage('interface_icons3', map).then((data) =>
      setBorderImage(data)
    );
  }

  return (
    <div
      className={`box box--${variant} ${className}`}
      style={{
        borderImage: `url('${borderImage?.url}') repeat`,
        borderImageSlice: borderImage?.slice,
      }}
    >
      <div className={`box__content ${contentClassName}`}>{children}</div>
    </div>
  );
}
