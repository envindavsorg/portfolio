import { GitBranchIcon, GitDiffIcon } from '@phosphor-icons/react/dist/ssr';
import { getCommitData } from '@/actions/github/commit.action';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { Panel } from '@/components/Panel';
import { Divider } from '@/components/ui/Divider';
import { Prose } from '@/components/ui/Typography';
import { dayjs } from '@/lib/utils';
import { FooterClock } from './FooterClock';
import { FooterDate } from './FooterDate';

export const Footer = async () => {
	const { branch, hash, updated } = await getCommitData();

	return (
		<footer className="max-w-screen overflow-x-hidden px-2">
			<Panel className="relative mx-auto md:max-w-3xl">
				<div className="pointer-events-none absolute inset-0 -z-1 grid gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="relative grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
					<div className="max-sm:screen-line-after flex items-center">
						<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
							<GitDiffIcon className="size-6 text-theme" weight="duotone" />
						</div>
						<div className="w-full flex-1 border-edge border-l p-3 text-left">
							<p className="mt-0.5 flex items-baseline gap-x-1 text-balance font-bold text-sm">
								{dayjs(updated).format('dddd DD MMM')}
								<span className="font-light text-[10px] text-theme">
									({dayjs(updated).fromNow()})
								</span>
							</p>
						</div>
					</div>
					<div className="flex items-center">
						<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
							<GitBranchIcon className="size-6 text-theme" weight="duotone" />
						</div>
						<div className="w-full flex-1 border-edge border-l p-3 text-left">
							<p className="mt-0.5 flex items-baseline gap-x-1 text-balance font-bold text-sm">
								{hash}
								<span className="font-light text-[10px] text-theme">
									(sur la branche {branch})
								</span>
							</p>
						</div>
					</div>
				</div>
			</Panel>

			<div className="mx-auto md:max-w-3xl">
				<Divider type="half" />
			</div>

			<FooterClock />

			<div className="mx-auto md:max-w-3xl">
				<Divider type="half" />
			</div>

			<div className="screen-line-before screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
				<Prose>développé avec beaucoup d'</Prose>
				<HeartIcon
					className="relative me-1 text-destructive after:absolute after:-inset-2"
					size={14}
				/>
				<Prose>à Paris.</Prose>
			</div>

			<FooterDate />

			<div className="pb-[env(safe-area-inset-bottom,0px)]">
				<div className="flex h-2" />
			</div>
		</footer>
	);
};
