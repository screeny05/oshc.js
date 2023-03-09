import React, { Children, ReactNode, useEffect, useState } from 'react';
import { extractSpriteFromSheet } from '../../../sprites/modify-sprite';

interface ButtonProps {
  children?: ReactNode;
}

export default function Button({ children }: ButtonProps) {
  const [borderImage, setBorderImage] = useState<string | undefined>();

  useEffect(() => {
    extractSpriteFromSheet('interface_icons3', 26).then((url) =>
      setBorderImage(url)
    );
  }, []);

  return (
    <button
      className="button"
      style={{
        position: 'relative',
        appearance: 'none',
        background: 'none',
        border: 'none',
        display: 'block',
        color: 'inherit',
        width: '100%',
      }}
    >
      <div
        style={{
          borderImage: `url('${borderImage}') 8 fill / 1 / 0 repeat`,
          borderWidth: '8px',
          borderStyle: 'solid',
          opacity: 0.7,
          position: 'absolute',
          inset: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 26,
        }}
      >
        {children}
      </div>
    </button>
  );
}
