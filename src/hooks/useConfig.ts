import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PACKAGE_MANAGERS = [
  "pnpm",
  "yarn",
  "npm",
  "bun",
] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
export type InstallationType = "cli" | "manual";

interface ConfigState {
  installationType: InstallationType;
  packageManager: PackageManager;
  setPackageManager: (packageManager: PackageManager) => void;
}

const useConfig = create<ConfigState>()(
  persist(
    (set) => ({
      installationType: "cli",
      packageManager: "pnpm",
      setPackageManager: (packageManager) => set({ packageManager }),
    }),
    {
      /**
       * `version` + `migrate` sont indispensables sur un store persisté : sans
       * eux, un localStorage écrit par une version antérieure du schéma est
       * rehydraté tel quel, et un champ renommé ou supprimé remonte dans l'état
       * courant sous son ancienne forme.
       *
       * `migrate` repart de l'état par défaut plutôt que de tenter une
       * conversion : la seule donnée réellement utile ici est le gestionnaire de
       * paquets choisi, la reperdre est sans conséquence.
       */
      migrate: (persisted, version) => {
        if (version === 0) {
          const legacy = persisted as Partial<ConfigState> | null;
          return {
            installationType: "cli",
            packageManager: PACKAGE_MANAGERS.includes(
              legacy?.packageManager as PackageManager
            )
              ? (legacy?.packageManager as PackageManager)
              : "pnpm",
          } as ConfigState;
        }
        return persisted as ConfigState;
      },
      name: "envindavsorg.config",
      version: 1,
    }
  )
);

export default useConfig;
