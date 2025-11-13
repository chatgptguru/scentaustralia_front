import { createTheme } from '@mui/material/styles';

// Scent Australia brand colors
const scentAustraliaColors = {
  primary: {
    main: '#2E7D32', // Deep green - representing nature and freshness
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#FF6B35', // Warm orange - representing warmth and energy
    light: '#FF8A65',
    dark: '#E64A19',
    contrastText: '#ffffff',
  },
  accent: {
    main: '#6A1B9A', // Purple - representing luxury and sophistication
    light: '#9C27B0',
    dark: '#4A148C',
  },
  neutral: {
    main: '#F5F5F5',
    light: '#FAFAFA',
    dark: '#E0E0E0',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: scentAustraliaColors.primary,
    secondary: scentAustraliaColors.secondary,
    background: scentAustraliaColors.background,
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#212121',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#212121',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#212121',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#212121',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: scentAustraliaColors.background.gradient,
          boxShadow: '0 2px 12px rgba(46, 125, 50, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
