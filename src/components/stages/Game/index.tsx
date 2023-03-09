import React, { useRef } from 'react';
import { Engine } from '../../../game/engine';
import ClickableSprite from '../../atoms/ClickableSprite';
import Spritesheet from '../../atoms/Spritesheet';
import { StageProps } from '../../game-ui';
import './index.css';

export default function StageGame(props: StageProps) {
  const engineRef = useRef<Engine | null>(null);

  return (
    <div className="stage-game">
      <canvas
        id="game-canvas"
        className="stage-game__game"
        ref={(canvas) => {
          if (canvas) {
            engineRef.current = new Engine(canvas);
            engineRef.current.load().then(() => engineRef.current?.init());
          }
        }}
      />

      <div className="stage-game__hud hud">
        <div className="hud__bottom-bar bottom-bar">
          <div className="bottom-bar__left"></div>
          <div className="bottom-bar__menu">
            <Spritesheet spritesheet="interface_buttons" index={6} />
          </div>
          <div className="bottom-bar__actions-banner">
            <ClickableSprite
              spritesheet="interface_buttons"
              index={25}
              hoverIndex={26}
            />
            <ClickableSprite
              spritesheet="interface_buttons"
              index={27}
              hoverIndex={28}
            />
            <ClickableSprite
              spritesheet="interface_buttons"
              index={29}
              hoverIndex={30}
            />
            <ClickableSprite
              spritesheet="interface_buttons"
              index={68}
              hoverIndex={69}
              disabledIndex={70}
              isDisabled
            />
          </div>
          <div className="bottom-bar__minimap"></div>
          <div className="bottom-bar__scribe">
            <Spritesheet spritesheet="scribe" index={0} />
            <ClickableSprite
              spritesheet="interface_buttons"
              index={31}
              hoverIndex={32}
            />
          </div>
          <div className="bottom-bar__right"></div>
        </div>
      </div>
    </div>
  );
}
