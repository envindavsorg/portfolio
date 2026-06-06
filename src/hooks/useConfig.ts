import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PackageManager = "pnpm" | "yarn" | "npm" | "bun";
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
    { name: "envindavsorg.config" }
  )
);

export default useConfig;
