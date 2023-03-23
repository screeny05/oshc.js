import React, { useRef } from 'react';
import { BrowserFrontend } from '../../../game/browser-frontend';
import { Engine } from '../../../game/engine';
import ClickableSprite from '../../atoms/ClickableSprite';
import Spritesheet from '../../atoms/Spritesheet';
import { StageProps } from '../../game-ui';
import SpritesheetDebugger from '../../molecules/SpritesheetDebugger';
import './index.css';

export default function StageGame(props: StageProps) {
  const engineRef = useRef<Engine | null>(null);
  const frontendRef = useRef<BrowserFrontend | null>(null);

  //return <SpritesheetDebugger spritesheet="icons_placeholders" />;

  return (
    <div className="stage-game">
      <canvas
        id="game-canvas"
        className="stage-game__game"
        ref={(canvas) => {
          if (canvas) {
            BrowserFrontend.load().then(() => {
              frontendRef.current = new BrowserFrontend(canvas);
              engineRef.current = new Engine();
              frontendRef.current.startEngine(engineRef.current);
            });
          }
        }}
      />

      <div className="stage-game__hud hud">
        <div className="hud__bottom-bar bottom-bar">
          <div className="bottom-bar__left"></div>
          <Spritesheet className="bottom-bar__menu" spritesheet="interface_buttons" index={6}>
            <ClickableSprite
              spritesheet="icons_placeholders"
              index={16}
              hoverIndex={17}
              onClick={() => frontendRef.current?.setMouseActionState('place')}
            />
            <ClickableSprite
              spritesheet="icons_placeholders"
              index={18}
              hoverIndex={19}
              onClick={() => frontendRef.current?.setMouseActionState('moveTo')}
            />
            <ClickableSprite
              spritesheet="icons_placeholders"
              index={20}
              hoverIndex={21}
              onClick={() => frontendRef.current?.setMouseActionState('build')}
            />
          </Spritesheet>
          <div className="bottom-bar__actions-banner">
            <ClickableSprite spritesheet="interface_buttons" index={25} hoverIndex={26} />
            <ClickableSprite spritesheet="interface_buttons" index={27} hoverIndex={28} />
            <ClickableSprite spritesheet="interface_buttons" index={29} hoverIndex={30} />
            <ClickableSprite spritesheet="interface_buttons" index={68} hoverIndex={69} disabledIndex={70} isDisabled />
          </div>
          <div className="bottom-bar__minimap"></div>
          <div className="bottom-bar__scribe">
            <Spritesheet spritesheet="scribe" index={0} />
            <ClickableSprite spritesheet="interface_buttons" index={31} hoverIndex={32} />
          </div>
          <div className="bottom-bar__right"></div>
        </div>
      </div>
    </div>
  );
}
