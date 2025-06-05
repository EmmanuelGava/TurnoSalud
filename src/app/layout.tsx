import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppStateWrapper from './AppStateWrapper';
import { ThemeProvider } from './providers';


export const metadata: Metadata = {
  title: 'TurnoSalud - Farmacias de Turno en Argentina',
  description: 'Encuentra farmacias de turno 24hs por barrio o localidad en Argentina.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppStateWrapper>
            {children}
          </AppStateWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
