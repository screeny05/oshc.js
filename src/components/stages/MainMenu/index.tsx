import React, { useState } from 'react';
import ClickableSprite from '../../atoms/ClickableSprite';
import Spritesheet from '../../atoms/Spritesheet';
import VideoWithLoop from '../../atoms/VideoWithLoop';
import { StageProps } from '../../game-ui';
import SpritesheetDebugger from '../../molecules/SpritesheetDebugger';
import Typo from '../../molecules/Typo';
import Stage from '../../Stage';
import './index.css';

const AxeHoverEffect = () => {
  return (
    <Spritesheet
      className="main-button__hover-element"
      spritesheet="icons_front_end"
      index={0}
      maskIndex={1}
    />
  );
};

export default function StageMainMenu({ onNavigate }: StageProps) {
  const infoTexts = [
    'Nehmt es mit den feindlichen Fürsten auf ...durch Burgenbau, Verteidigung und Strategie!',
    'Lernt, zur Zeit der Kreuzzüge in der Wüste zu überleben',
    'Genießt die Ruhe - nur die Kamele leisten Euch Gesellschaft!',
    'Verschont weder Freund noch Feind!',
    'Entwerft und spielt Eure eigenen Karten.',
    'Optionen',
    'Lehrstunde',
    'Credits',
    'Crusader verlassen',
  ];
  const [currentInfoText, setCurrentInfoText] = useState('');

  const handleMenuButtonHover = (text: number) => (isHovered: boolean) =>
    setCurrentInfoText(isHovered ? infoTexts[text] : '');

  return (
    <Stage
      className="stage-main-menu"
      background="/orgx/gfx/frontend_main.png"
      music="astrongspice"
    >
      <div
        style={{
          display: 'none',
          background: 'linear-gradient(to bottom, #000 132px, magenta 0)',
          width: '4200px',
          padding: 100,
          position: 'absolute',
          zIndex: 1,
        }}
      >
        <Typo test text="" font="aaSmall" />
      </div>
      <VideoWithLoop
        introSrc="/orgx/binks/richard_swordswing.mp4"
        loopSrc="/orgx/binks/richard_ambient.mp4"
        className="stage-main-menu__richard"
        width={292}
        height={484}
      />
      <ClickableSprite
        className="stage-main-menu__button-exit"
        spritesheet="icons_front_end"
        index={4}
        hoverIndex={5}
        hoverFx="exitrollover"
        onHover={handleMenuButtonHover(8)}
      />
      <ClickableSprite
        className="stage-main-menu__button-options"
        spritesheet="icons_front_end"
        index={6}
        hoverIndex={7}
        onHover={handleMenuButtonHover(5)}
      />
      <ClickableSprite
        className="stage-main-menu__button-tutorial"
        spritesheet="icons_front_end"
        index={2}
        hoverIndex={3}
        onHover={handleMenuButtonHover(6)}
      />
      <ClickableSprite
        className="stage-main-menu__button-credits"
        spritesheet="icons_front_end"
        index={8}
        hoverIndex={9}
        onHover={handleMenuButtonHover(7)}
      />
      <ClickableSprite
        className="main-button stage-main-menu__button-menu stage-main-menu__button-menu--1"
        spritesheet="icons_front_end"
        index={12}
        hoverIndex={13}
        hoverFx="Shieldrollover"
        onHover={handleMenuButtonHover(0)}
        onClick={() => onNavigate('game')}
      >
        <AxeHoverEffect />
        <Typo className="main-button__text" text="Kreuzzug" font="aaLarge" />
      </ClickableSprite>
      <ClickableSprite
        className="main-button stage-main-menu__button-menu stage-main-menu__button-menu--2"
        spritesheet="icons_front_end"
        index={10}
        hoverIndex={11}
        hoverFx="Shieldrollover"
        onHover={handleMenuButtonHover(1)}
      >
        <AxeHoverEffect />
        <Typo
          className="main-button__text"
          text="Historische Kampagnen"
          font="aaLarge"
        />
      </ClickableSprite>
      <ClickableSprite
        className="main-button stage-main-menu__button-menu stage-main-menu__button-menu--3"
        spritesheet="icons_front_end"
        index={14}
        hoverIndex={15}
        hoverFx="Shieldrollover"
        onHover={handleMenuButtonHover(2)}
      >
        <AxeHoverEffect />
        <Typo className="main-button__text" text="Burgenbau" font="aaLarge" />
      </ClickableSprite>
      <ClickableSprite
        className="main-button stage-main-menu__button-menu stage-main-menu__button-menu--4"
        spritesheet="icons_front_end"
        index={16}
        hoverIndex={17}
        hoverFx="Shieldrollover"
        onHover={handleMenuButtonHover(3)}
      >
        <AxeHoverEffect />
        <Typo className="main-button__text" text="Mehrspieler" font="aaLarge" />
      </ClickableSprite>
      <ClickableSprite
        className="main-button stage-main-menu__button-menu stage-main-menu__button-menu--5"
        spritesheet="icons_front_end"
        index={18}
        hoverIndex={19}
        hoverFx="Shieldrollover"
        onHover={handleMenuButtonHover(4)}
      >
        <AxeHoverEffect />
        <Typo
          className="main-button__text"
          text="Eigene Szenarien"
          font="aaLarge"
        />
      </ClickableSprite>

      <div className="stage-main-menu__info-text">
        <Typo text={currentInfoText} font="aaMedium" showOrnamentalInitial />
      </div>
    </Stage>
  );
}
