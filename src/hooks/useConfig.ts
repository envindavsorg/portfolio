import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';
export type InstallationType = 'cli' | 'manual';

interface Config {
	packageManager: PackageManager;
	installationType: InstallationType;
}

const configAtom = atomWithStorage<Config>('envindavsorg.config', {
	packageManager: 'pnpm',
	installationType: 'cli',
});

const useConfig = () => useAtom(configAtom);

export default useConfig;
