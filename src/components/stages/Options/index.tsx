import React, { useState } from 'react';
import Button from '../../atoms/Button';
import Spritesheet from '../../atoms/Spritesheet';
import { StageProps } from '../../game-ui';
import Dialog from '../../molecules/Dialog';
import SpritesheetDebugger from '../../molecules/SpritesheetDebugger';
import Typo from '../../molecules/Typo';
import Stage from '../../Stage';

export default function StageOptionsMain({ onNavigate }: StageProps) {
  //return <SpritesheetDebugger spritesheet="interface_icons3" />;

  return (
    <Stage background="/orgx/gfx/frontend_main2.png">
      <Dialog headline="Spieloptionen">
        <Button>
          <Typo text="Laden" font="aaSmall" lineHeight={1} />
        </Button>

        <Button>
          <Typo text="Spieloptionen" font="aaSmall" lineHeight={1} />
        </Button>
        <Button>
          <Typo text="Grafikoptionen" font="aaSmall" lineHeight={1} />
        </Button>
        <Button>
          <Typo text="Soundoptionen" font="aaSmall" lineHeight={1} />
        </Button>
        <Button>
          <Typo text="Identität zulegen" font="aaSmall" lineHeight={1} />
        </Button>

        <Button>
          <Typo text="Zurück" font="aaSmall" lineHeight={1} />
        </Button>
        <Button>
          <Typo text="Crusader verlassen" font="aaSmall" lineHeight={1} />
        </Button>
      </Dialog>
    </Stage>
  );
}
