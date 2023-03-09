import React, { useState } from 'react';
import Cursor from './atoms/Cursor';
import './game-ui.css';
import SpritesheetDebugger from './molecules/SpritesheetDebugger';
import StageGame from './stages/Game';
import StageMainMenu from './stages/MainMenu';
import StageOptionsMain from './stages/Options';

export interface StageProps {
  onNavigate: (stage: StageType, props?: any) => void;
}

const STAGE_MAP = {
  main: StageMainMenu,
  options: StageOptionsMain,
  game: StageGame,
} as const satisfies Record<string, (props: StageProps) => JSX.Element>;

type StageType = keyof typeof STAGE_MAP;

export default function GameUi() {
  const [stage, setStage] = useState<StageType>('game');
  const StageElement = STAGE_MAP[stage];

  return (
    <div className="game-ui">
      <Cursor />
      {/*<SpritesheetDebugger spritesheet="tile_data" />*/}
      <StageElement onNavigate={(stage, props) => setStage(stage)} />
    </div>
  );
}

export const gameUi = (props: any = {}) => <GameUi {...props} />;
