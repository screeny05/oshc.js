import React, { ReactNode, useEffect, useState } from 'react';
import fxplayer from '../../fxplayer';
import Spritesheet from '../Spritesheet';

interface ClickableSpriteProps {
  className?: string;
  spritesheet: string;
  index: number;
  hoverIndex: number;
  hoverFx?: string;
  disabledIndex?: number;
  isDisabled?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  onHover?: (isHover: boolean) => void;
}

const isEnterEvent = (key: string): boolean => key === 'Enter' || key === ' ';

export default function ClickableSprite({
  className,
  spritesheet,
  index,
  hoverIndex,
  disabledIndex,
  isDisabled,
  hoverFx,
  children,
  onClick,
  onHover,
}: ClickableSpriteProps) {
  const [currentIndex, setCurrentIndex] = useState(index);

  if (hoverFx) {
    fxplayer.load(hoverFx);
  }

  const handleHoverEnter = () => {
    if (isDisabled) {
      return;
    }
    setCurrentIndex(hoverIndex);
    onHover?.(true);
    if (hoverFx) {
      fxplayer.play(hoverFx);
    }
  };

  const handleHoverLeave = () => {
    setCurrentIndex(index);
    onHover?.(false);
  };

  return (
    <Spritesheet
      className={className + ' clickable-sprite'}
      index={isDisabled ? disabledIndex! : currentIndex}
      spritesheet={spritesheet}
      onMouseDown={(e) => {
        if (isDisabled || e.button !== 0) {
          return;
        }
        onClick?.();
      }}
      onMouseEnter={() => handleHoverEnter()}
      onMouseLeave={() => handleHoverLeave()}
      onKeyDown={(e) => {
        if (isEnterEvent(e.key)) {
          handleHoverEnter();
        }
      }}
      onKeyUp={(e) => {
        if (isEnterEvent(e.key)) {
          handleHoverLeave();
        }
      }}
      tabIndex={1}
    >
      {children}
    </Spritesheet>
  );
}
