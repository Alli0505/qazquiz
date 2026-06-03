import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AnimatedBackground } from "~/components/animated-background";
import { HomeButton } from "~/components/home-button";
import { SoundToggle } from "~/components/sound-toggle";
import { TRPCReactProvider } from "~/trpc/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "QazQuiz",
  description: "Real-time multiplayer quiz battles.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <HomeButton />
        <SoundToggle />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
