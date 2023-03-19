import React, { useState } from 'react';
import { useGm1File } from '../../../sprites/data-loader';
import { chunk } from '../../../utils/chunk';
import Spritesheet from '../../atoms/Spritesheet';
import './index.css';

interface SpritesheetDebuggerProps {
  spritesheet: string;
  className?: string;
}

export default function SpritesheetDebugger({
  spritesheet,
  className = '',
}: SpritesheetDebuggerProps) {
  const spriteData = useGm1File(spritesheet);
  const chunkSize = 16;
  const chunkedSprites = spriteData ? chunk(spriteData.images, chunkSize) : [];

  return (
    <div className={`spritesheet-debugger ${className}`}>
      <table className="spritesheet-debugger__table">
        <thead>
          <tr>
            {chunkedSprites[0]?.map((_, column) => (
              <th key={column}>0x{column.toString(16)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chunkedSprites.map((chunk, i) => (
            <tr key={i}>
              {chunk.map((_, j) => {
                const index = i * chunkSize + j;

                return (
                  <td title={index.toString()} key={`${spritesheet}:${index}`}>
                    <Spritesheet spritesheet={spritesheet} index={index} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
