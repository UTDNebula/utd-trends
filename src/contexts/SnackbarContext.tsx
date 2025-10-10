'use client';

import { Alert, Snackbar } from '@mui/material';
import React, { createContext, useCallback,useContext, useState } from 'react';

interface SnackbarContextType {
  showConflictMessage: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [openConflictMessage, setOpenConflictMessage] = useState(false);

  const showConflictMessage = useCallback(() => {
    setOpenConflictMessage(true);
  }, []);

  const handleConflictMessageClose = useCallback(
    (_: unknown, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenConflictMessage(false);
    },
    [],
  );

  return (
    <SnackbarContext.Provider value={{ showConflictMessage }}>
      {children}
      <Snackbar
        open={openConflictMessage}
        autoHideDuration={6000}
        onClose={handleConflictMessageClose}
      >
        <Alert
          onClose={handleConflictMessageClose}
          severity="error"
          variant="filled"
          className="w-full"
        >
          This section conflicts with your schedule!
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}
