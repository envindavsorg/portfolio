import { Header } from '@/components/features/Header';
import { Overview } from '@/components/features/Overview';
import { Divider } from '@/components/ui/Divider';

const Page = () => (
	<div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl">
		<div className="screen-line-after after:-bottom-px grow border-edge border-x">
			<div className="flex h-4" />
		</div>

		<Header />
		<Divider />
		<Overview />

		<div className="grow border-edge border-x" />
	</div>
);

export default Page;
