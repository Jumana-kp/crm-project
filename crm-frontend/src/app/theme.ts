import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5B4DDE",
      light: "#EDE9FE",
      dark: "#4B3FD0",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#010302",
    },

    background: {
      default: "#F5F6FA",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
    },

    divider: "#E5E7EB",

    success: {
      main: "#22C55E",
    },

    warning: {
      main: "#F59E0B",
    },

    error: {
      main: "#EF4444",
    },

    info: {
      main: "#3B82F6",
    },

    grey: {
      50: "#F9FAFB",
      100: "#F4F5F6",
      200: "#EAEEF4",
      300: "#E5E7EB",
      400: "#A2A4A7",
      500: "#7E92A2",
      600: "#6B7280",
    },
  },

  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",

    h1: {
      fontSize: "40px",
      fontWeight: 700,
    },

    h2: {
      fontSize: "34px",
      fontWeight: 700,
    },

    h3: {
      fontSize: "32px",
      fontWeight: 600,
    },

    h4: {
      fontSize: "28px",
      fontWeight: 600,
    },

    h5: {
      fontSize: "24px",
      fontWeight: 600,
    },

    h6: {
      fontSize: "20px",
      fontWeight: 600,
    },

    body1: {
      fontSize: "16px",
      fontWeight: 400,
    },

    body2: {
      fontSize: "14px",
      fontWeight: 400,
    },

    button: {
      fontSize: "14px",
      fontWeight: 500,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: 12,
  },

  spacing: 8,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          boxShadow: "none",

          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;