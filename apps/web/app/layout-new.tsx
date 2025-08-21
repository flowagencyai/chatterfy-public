import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "./contexts/ChatContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SessionProvider>
      </body>
    </html>
  );
}