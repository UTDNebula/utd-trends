'use client';

import { createTheme } from '@mui/material/styles';

const lightPalette = {
  palette: {
    //copied from globals.css
    primary: {
      main: '#573dff',
    },
    secondary: {
      main: '#573dff',
      light: '#c2c8ff',
    },
    error: {
      main: '#ff5743',
    },
  },
};
const darkPalette = {
  palette: {
    //copied from globals.css
    primary: {
      main: '#a297fd',
    },
    secondary: {
      main: '#573dff',
      light: '#c2c8ff',
    },
    error: {
      main: '#ff5743',
    },
  },
};
const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: lightPalette,
    dark: darkPalette,
  },
  typography: {
    fontFamily: 'inherit',
  },
  breakpoints: {
    values: {
      //copied from globals.css
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: '64px', // more height for easier tapping
        },
      },
    },
    MuiBottomNavigationAction: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          color: 'var(--mui-palette-text-disabled)', // default color for unselected state
          transition: 'color 0.3s ease',
          gap: '4px', // add space between icon and label
          paddingTop: '4px',
          // add background pill highlight for the selected icon using a pseudo-element
          '& > :first-child:not(.MuiBottomNavigationAction-label)': {
            position: 'relative',
            '*': {
              'z-index': '1', // put icon above highlihgt
            },
            ':after': {
              // the pill highlight pseudo-element
              content: '""',
              'z-index': '0',
              position: 'absolute',
              inset: '0',
              margin: '-0.25rem 1rem',
              backgroundColor:
                'rgba(var(--mui-palette-primary-mainChannel) / 0.1)',
              borderRadius: '100vw',
              transition: 'margin 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            },
          },
          // change the position of the pill highlight and the color of the label when selected
          '&.Mui-selected': {
            '& > :first-child:not(.MuiBottomNavigationAction-label)': {
              ':after': {
                margin: '-0.25rem -1rem', // expand pill to cover width & height of icon
              },
            },
            '& > .MuiBottomNavigationAction-label': {
              color: 'var(--mui-palette-text-secondary)', // label select color
            },
            '& .MuiSvgIcon-root': {
              stroke: 'currentColor',
              strokeWidth: '0.7', // thicken stroke of selected icon
              paintOrder: 'stroke fill',
            },
          },
        },
        label: {
          fontSize: '0.75rem',
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
});

export default theme;
