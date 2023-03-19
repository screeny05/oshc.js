import React, { useEffect, useState } from 'react';
import { useInterval } from 'react-interval-hook';
import { animationSetArabGrenadier } from '../../../data/animation-set';
import { useGm1File } from '../../../sprites/data-loader';
import Spritesheet from '../../atoms/Spritesheet';
import SpritesheetDebugger from '../SpritesheetDebugger';
import './index.css';

interface AnimationDebuggerProps {
  spritesheet: string;
}

export function AnimationDebugger({ spritesheet }: AnimationDebuggerProps) {
  const [fps, setFps] = useState(20);
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [minHeight, setMinHeight] = useState(100);
  const [increments, setIncrements] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const spriteData = useGm1File(spritesheet, (gm1) => {
    setEndFrame(gm1.images.length - 1);
    setMinHeight(Math.max(...gm1.images.map((entry) => entry.h)));
  });

  const timer = useInterval(() => {
    if (!spriteData || !isPlaying) {
      return;
    }

    let nextIndex = currentIndex + increments;
    if (nextIndex > endFrame) {
      nextIndex = startFrame;
    }
    setCurrentIndex(nextIndex);
  }, 1000 / fps);

  useEffect(() => {
    timer.stop();
    timer.start();
  }, [fps, isPlaying]);

  return (
    <div
      className="animation-debugger"
      style={
        {
          '--spriteMaxHeight': minHeight + 'px',
          '--height': spriteData?.images[currentIndex].h + 'px',
          '--centerX': (spriteData?.animations?.[currentIndex]?.centerX ?? 0) + 'px',
          '--centerY': (spriteData?.animations?.[currentIndex]?.centerY ?? 0) + 'px',
        } as any
      }
    >
      <div className="animation-debugger__player-container">
        <Spritesheet className="animation-debugger__player" spritesheet={spritesheet} index={currentIndex} />
      </div>
      FPS:
      <input
        type="number"
        onChange={(e) => {
          setFps(Number.parseInt(e.target.value));
        }}
        value={fps}
        min={0}
      />
      Start Frame:
      <input type="number" onChange={(e) => setStartFrame(Number.parseInt(e.target.value))} value={startFrame} min={0} />
      End Frame:
      <input type="number" onChange={(e) => setEndFrame(Number.parseInt(e.target.value))} value={endFrame} min={-1} />
      Frame Increments:
      <input type="number" onChange={(e) => setIncrements(Number.parseInt(e.target.value))} value={increments} min={-1} />
      <div className="animation-debugger__play-bar">
        <button className="play-bar__play-toggle" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="play-bar__position">
          {currentIndex}/{(spriteData?.images.length ?? 0) - 1}
        </div>
        <input
          className="play-bar__progress"
          type="range"
          onChange={(e) => setCurrentIndex(Number.parseInt(e.target.value, 10))}
          min={0}
          max={(spriteData?.images.length ?? 0) - 1}
          value={currentIndex}
        />
        <button onClick={() => setCurrentIndex(Math.max(currentIndex - increments, 0))}>&lt;</button>
        <button onClick={() => setCurrentIndex(Math.min(currentIndex + increments, (spriteData?.images.length ?? 0) - 1))}>&gt;</button>
      </div>
      <select
        onChange={(e) => {
          const preset = animationSetArabGrenadier[e.target.value as keyof typeof animationSetArabGrenadier];
          if (!preset) {
            return;
          }
          setCurrentIndex(preset.offset);
          setStartFrame(preset.offset);
          setEndFrame(preset.offset + (preset.frames - 1) * preset.increment);
          setIncrements(preset.increment);
        }}
        defaultValue="none"
      >
        <option disabled value="none" />
        {Object.keys(animationSetArabGrenadier).map((key) => (
          <option key={key} value={key}>
            ArabGrenadier: {key}
          </option>
        ))}
      </select>
      <SpritesheetDebugger className="animation-debugger__spritesheet" spritesheet={spritesheet} />
    </div>
  );
}
