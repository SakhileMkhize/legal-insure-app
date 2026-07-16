import { createTheme } from "@mui/material/styles";

const NAVY = "#0A1F44";
const NAVY_DARK = "#061530";
const NAVY_LIGHT = "#1E3A66";
const YELLOW = "#FFD100";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: NAVY, dark: NAVY_DARK, light: NAVY_LIGHT, contrastText: "#FFFFFF" },
    secondary: { main: YELLOW, dark: "#E6BC00", light: "#FFE352", contrastText: NAVY },
    background: { default: "#F7F8FA", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#4B5563" },
    success: { main: "#1E7A67" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 20 },
        containedSecondary: { color: NAVY },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: "0 4px 20px rgba(10,31,68,0.06)" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
