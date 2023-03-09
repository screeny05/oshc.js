import React from 'react';
import { useState } from 'react';

interface VideoWithLoopProps {
  introSrc: string;
  loopSrc: string;
  className?: string;
  width: number;
  height: number;
}

export default function VideoWithLoop({
  introSrc,
  loopSrc,
  className,
  width,
  height,
}: VideoWithLoopProps) {
  const [isLooping, setIsLooping] = useState(false);

  return (
    <>
      <video
        className={className}
        style={{ display: !isLooping ? 'block' : 'none' }}
        src={introSrc}
        autoPlay
        onEnded={() => {
          setIsLooping(true);
        }}
        muted
        width={width}
        height={height}
        tabIndex={-1}
      />
      <video
        className={className}
        style={{ display: isLooping ? 'block' : 'none' }}
        src={loopSrc}
        autoPlay={isLooping}
        loop
        muted
        width={width}
        height={height}
        tabIndex={-1}
      />
    </>
  );
}
