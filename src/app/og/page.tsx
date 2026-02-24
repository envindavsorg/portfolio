import { Header } from '@/app/(content)/(root)/_components/header/Header';
import { Overview } from '@/app/(content)/(root)/_components/overview/Overview';
import { FooterClock } from '@/components/layouts/footer/FooterClock';
import { Divider } from '@/components/primitives/Divider';

const Page = () => (
	<div className="mx-auto flex h-screen flex-col justify-center md:max-w-3xl px-2">
		<Divider type="half" />
		<Header capture />
		<Divider type="half" />
		<Overview />
		<Divider type="half" after={false} />
		<FooterClock isActionnable={false} />
		<Divider type="half" before={false} />
	</div>
);

export default Page;
