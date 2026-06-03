"use client";

import { usePathname, useRouter } from "next/navigation";

import { useI18n } from "~/i18n";
import { getSocket } from "~/lib/socket";
import { sfx } from "~/lib/sfx";
import { useGameStore } from "~/store/game-store";

export function HomeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { m } = useI18n();

  // No need for a "home" button on the home page.
  if (pathname === "/") return null;

  return (
    <button
      type="button"
      aria-label={m.common.home}
      title={m.common.home}
      onClick={() => {
        sfx.play("click");
        // Leave any active game and clear local state before navigating.
        const socket = getSocket();
        if (socket.connected) socket.emit("lobby:leave");
        useGameStore.getState().reset();
        router.push("/");
      }}
      className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-lg shadow-md backdrop-blur transition-transform hover:scale-110 dark:bg-zinc-800/70"
    >
      🏠
    </button>
  );
}
