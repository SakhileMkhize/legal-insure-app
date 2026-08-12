import { createTheme, alpha } from "@mui/material/styles";

const GRAY = "#52525B";
const GRAY_DARK = "#3F3F46";
const GRAY_LIGHT = "#A1A1AA";
const BLUE = "#3B82F6";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: GRAY,
            dark: GRAY_DARK,
            light: GRAY_LIGHT,
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: BLUE,
            dark: "#2563EB",
            light: "#93C5FD",
            contrastText: "#FFFFFF",
        },
        background: { default: "#FAFAFA", paper: "#FFFFFF" },
        text: { primary: "#111827", secondary: "#4B5563" },
        success: { main: "#16A34A" },
        warning: { main: "#D97706" },
        error: { main: "#DC2626" },
        info: { main: "#0EA5E9" },
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
                root: { borderRadius: 8, paddingInline: 20 },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { boxShadow: "none" },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(63,63,70,0.06)",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: ({ ownerState, theme }) => {
                    const base = {
                        fontWeight: 600,
                        borderRadius: 6,
                    };

                    const color = ownerState.color;
                    if (
                        ownerState.variant === "filled" &&
                        color &&
                        color !== "default" &&
                        theme.palette[color]
                    ) {
                        const c = theme.palette[color];
                        return {
                            ...base,
                            backgroundColor: alpha(c.main, 0.14),
                            color: c.dark ?? c.main,
                            border: `1px solid ${alpha(c.main, 0.3)}`,
                        };
                    }

                    return base;
                },
            },
        },
    },
});

export default theme;
