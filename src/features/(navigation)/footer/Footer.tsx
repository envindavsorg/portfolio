import { getCommitData } from '@/actions/github/commit.action';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { Divider } from '@/components/ui/Divider';
import { FooterMetadata } from '@/features/(navigation)/footer/FooterMetadata';
import { FooterClock } from './FooterClock';
import { FooterDate } from './FooterDate';

export const Footer = async () => {
	const { branch, hash, updated } = await getCommitData();

	return (
		<footer className="max-w-screen overflow-x-hidden px-2">
			<FooterMetadata branch={branch} hash={hash} updated={updated} />

			<div className="mx-auto md:max-w-3xl">
				<Divider />
			</div>

			<FooterClock />

			<div className="mx-auto md:max-w-3xl">
				<Divider />
			</div>

			<div className="screen-line-before screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
				<p className="text-balance text-muted-foreground text-xs">
					Développé avec beaucoup d'
				</p>
				<HeartIcon
					className="relative me-1 text-destructive after:absolute after:-inset-2"
					size={12}
				/>
				<p className="text-balance text-muted-foreground text-xs">à Paris.</p>
			</div>

			<FooterDate />

			<div className="pb-[env(safe-area-inset-bottom,0px)]">
				<div className="flex h-2" />
			</div>
		</footer>
	);
};
