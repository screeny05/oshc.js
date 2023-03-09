import React, { ReactNode, useState } from 'react';
import Box from '../Box';
import DialogHeader from '../DialogHeader';
import './index.css';

interface DialogProps {
  headline: string;
  children: ReactNode;
}

export default function Dialog({ headline, children }: DialogProps) {
  return (
    <Box className="dialog" variant="red-big">
      <DialogHeader className="dialog__header" text={headline} />
      {children}
    </Box>
  );
}
