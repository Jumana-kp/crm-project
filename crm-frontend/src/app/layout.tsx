// import "./globals.css";
import AppThemeProvider from "./components/AppThemeProvider";

import ReduxProvider from "@/store/provider";
export default function RootLayout({
   children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, minHeight: "100vh" }}>
        
          <ReduxProvider>
            <AppThemeProvider>
             {children}
          </AppThemeProvider>
          </ReduxProvider>
      </body>
    </html>
  );
}


