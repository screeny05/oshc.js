import React, { useState } from 'react';
import { useInterval } from 'react-interval-hook';
import { useIndexFile } from '../../../sprites/data-loader';
import Spritesheet from '../../atoms/Spritesheet';
import SpritesheetDebugger from '../SpritesheetDebugger';
import './index.css';

interface AnimationDebuggerProps {
  spritesheet: string;
}

export function AnimationDebugger({ spritesheet }: AnimationDebuggerProps) {
  const [speed, setSpeed] = useState(10);
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minHeight, setMinHeight] = useState(100);
  const spriteData = useIndexFile(spritesheet, (data) => {
    setEndFrame(data.length);
    setMinHeight(Math.max(...data.map((entry) => entry.h)));
  });

  const timer = useInterval(() => {
    let nextIndex = currentIndex + 1;
    if (endFrame !== -1 && nextIndex > endFrame) {
      nextIndex = startFrame;
    }
    if (endFrame === -1 && spriteData && nextIndex > spriteData.length) {
      nextIndex = startFrame;
    }
    setCurrentIndex(nextIndex);
  }, 1000 / speed);

  return (
    <div
      className="animation-debugger"
      style={{ '--spriteHeight': minHeight + 'px' } as any}
    >
      <div style={{ minHeight: minHeight }}>
        <Spritesheet
          className="animation-debugger__player"
          spritesheet={spritesheet}
          index={currentIndex}
        />
      </div>
      Speed:
      <input
        type="number"
        onChange={(e) => {
          timer.stop();
          setSpeed(Number.parseInt(e.target.value));
          timer.start();
        }}
        value={speed}
        min={0}
      />
      Start Frame:
      <input
        type="number"
        onChange={(e) => setStartFrame(Number.parseInt(e.target.value))}
        value={startFrame}
        min={0}
      />
      End Frame:
      <input
        type="number"
        onChange={(e) => setEndFrame(Number.parseInt(e.target.value))}
        value={endFrame}
        min={-1}
      />
      <SpritesheetDebugger
        className="animation-debugger__spritesheet"
        spritesheet={spritesheet}
      />
    </div>
  );
}
