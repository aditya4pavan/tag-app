'use client';
import '@fontsource/lato';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Template({ children }: { children: React.ReactNode }) {

    const theme = createTheme({
        typography: {
            fontFamily: [
                '"Lato"',
                '"Work Sans"',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
        },
    });

    return <ThemeProvider theme={theme}>
        {children}
    </ThemeProvider>
}