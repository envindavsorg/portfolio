import {
	BriefcaseIcon,
	EnvelopeIcon,
	FlaskIcon,
	PhoneIcon,
} from '@phosphor-icons/react/dist/ssr';
import { TextAnimate } from '@/components/text/TextAnimate';
import GLOBAL_DATA from '@/content/data/global';

interface WavyMotionProps {
	label: string;
	delay: number;
}

const WavyMotion = ({ label, delay }: WavyMotionProps) => (
	<TextAnimate
		by="character"
		className="text-balance font-medium font-sans text-sm"
		delay={delay}
		variants={{
			hidden: {
				opacity: 0,
				y: 30,
				rotate: 45,
				scale: 0.5,
			},
			show: (i) => ({
				opacity: 1,
				y: 0,
				rotate: 0,
				scale: 1,
				transition: {
					delay: i * 0.1,
					duration: 0.4,
					y: {
						type: 'spring',
						damping: 12,
						stiffness: 200,
						mass: 0.8,
					},
					rotate: {
						type: 'spring',
						damping: 8,
						stiffness: 150,
					},
					scale: {
						type: 'spring',
						damping: 10,
						stiffness: 300,
					},
				},
			}),
			exit: (i) => ({
				opacity: 0,
				y: 30,
				rotate: 45,
				scale: 0.5,
				transition: {
					delay: i * 0.1,
					duration: 0.4,
				},
			}),
		}}
	>
		{label}
	</TextAnimate>
);

export const OverviewContent = () => (
	<>
		<div className="screen-line-after screen-line-before relative grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
			<div className="max-sm:screen-line-after flex items-center">
				<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					<BriefcaseIcon className="size-6 text-theme" weight="duotone" />
				</div>
				<div className="w-full flex-1 border-edge border-l p-3 text-left">
					<WavyMotion delay={0.15} label={GLOBAL_DATA.WORK.title} />
				</div>
			</div>

			<div className="flex items-center">
				<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					<FlaskIcon className="size-6 text-theme" weight="duotone" />
				</div>
				<div className="w-full flex-1 border-edge border-l p-3 text-left">
					<WavyMotion delay={0.25} label={GLOBAL_DATA.WORK.experience} />
				</div>
			</div>
		</div>

		<div className="screen-line-after grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
			<div className="max-sm:screen-line-after flex items-center">
				<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					<PhoneIcon className="size-6 text-theme" weight="duotone" />
				</div>
				<div className="w-full flex-1 border-edge border-l p-3 text-left">
					<WavyMotion delay={0.35} label={GLOBAL_DATA.USER.phoneNumber} />
				</div>
			</div>
			<div className="flex items-center">
				<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					<EnvelopeIcon className="size-6 text-theme" weight="duotone" />
				</div>
				<div className="w-full flex-1 border-edge border-l p-3 text-left">
					<WavyMotion delay={0.45} label={GLOBAL_DATA.USER.emailAddress} />
				</div>
			</div>
		</div>
	</>
);
