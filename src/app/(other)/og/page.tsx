import { Divider } from '@/components/ui/Divider';
import { Header } from '@/features/(homepage)/header/Header';
import { Overview } from '@/features/(homepage)/overview/Overview';

const Page = () => (
	<div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl">
		<div className="screen-line-after grow border-edge border-x after:-bottom-px">
			<div className="flex h-4" />
		</div>

		<Header />
		<Divider />
		<Overview />

		<div className="grow border-edge border-x" />
	</div>
);

export default Page;
