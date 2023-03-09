import React, { useState } from 'react';
import './index.css';
import Spritesheet from '../../atoms/Spritesheet';
import Box from '../Box';
import Typo from '../Typo';

interface DialogHeaderProps {
  text: string;
  className?: string;
}

export default function DialogHeader({
  text,
  className = '',
}: DialogHeaderProps) {
  return (
    <Box
      className={className}
      contentClassName={`dialog-header`}
      variant="red-small"
    >
      <Spritesheet
        className="dialog-header__ornament-left"
        spritesheet="interface_icons3"
        index={90}
        maskIndex={91}
      />

      <Typo
        className="dialog-header__text"
        text={text}
        font="aaXLarge"
        lineHeight="auto"
      />

      <Spritesheet
        className="dialog-header__ornament-right"
        spritesheet="interface_icons3"
        index={90}
        maskIndex={91}
      />
    </Box>
  );
}
