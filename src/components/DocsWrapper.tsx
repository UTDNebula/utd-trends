import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

import { SharedStateProvider } from '@/app/SharedStateProvider';
import theme from '@/modules/theme';

// Wrapper to inject types and state into Styleguidist docs
// Basically a simplified version of layout.tsx

export default function DocsWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-white dark:bg-black text-haiti dark:text-white">
      <ThemeProvider theme={theme}>
        <SharedStateProvider>{children}</SharedStateProvider>
      </ThemeProvider>
    </div>
  );
}
