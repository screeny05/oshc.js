import React, { ReactNode, useEffect, useRef } from 'react';
import fxplayer, { FxEntity } from '../fxplayer';
import './index.css';

interface StageProps {
  background: string;
  className?: string;
  children?: ReactNode;
  music?: string;
}

export default function Stage({
  background,
  className,
  children,
  music,
}: StageProps) {
  const fx = useRef<FxEntity | undefined>();

  useEffect(() => {
    if (music) {
      fx.current = fxplayer.play(`music/${music}`, { loop: true });
      return () => fx.current?.fadeOut();
    }
  }, []);

  return (
    <div
      className={'stage' + ' ' + className}
      onMouseDown={() => {
        if (fx.current) {
          fx.current.play();
        }
      }}
    >
      <div
        className="stage__inner"
        style={{ backgroundImage: `url('${background}')` }}
      >
        {children}
      </div>
    </div>
  );
}
