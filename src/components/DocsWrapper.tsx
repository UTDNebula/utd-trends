import { SharedStateProvider } from '@/app/SharedStateProvider';
import theme from '@/modules/theme';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';

// Wrapper to inject types and state into Styleguidist docs
// Basically a simplified version of layout.tsx

export default function DocsWrapper({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-white dark:bg-black text-haiti dark:text-white">
      <ThemeProvider theme={theme}>
        <SharedStateProvider latestSemester="Fall 2025">
          {children}
        </SharedStateProvider>
      </ThemeProvider>
    </div>
  );
}
