import React, { useState } from 'react';
import { useIndexFile } from '../../../sprites/data-loader';
import { chunk } from '../../../utils/chunk';
import Spritesheet from '../../atoms/Spritesheet';
import './index.css';

interface SpritesheetDebuggerProps {
  spritesheet: string;
}

export default function SpritesheetDebugger({
  spritesheet,
}: SpritesheetDebuggerProps) {
  const spriteData = useIndexFile(spritesheet);
  const chunkSize = 16;
  const chunkedSprites = spriteData ? chunk(spriteData, chunkSize) : [];

  return (
    <div className="spritesheet-debugger">
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
