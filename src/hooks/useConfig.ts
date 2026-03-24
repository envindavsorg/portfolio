import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type PackageManager = "pnpm" | "yarn" | "npm" | "bun";
export type InstallationType = "cli" | "manual";

interface Config {
  packageManager: PackageManager;
  installationType: InstallationType;
}

const configAtom = atomWithStorage<Config>("envindavsorg.config", {
  installationType: "cli",
  packageManager: "pnpm",
});

const useConfig = () => useAtom(configAtom);

export default useConfig;
