import { Prose } from '@/components/primitives/Typography';
import GLOBAL_DATA from '@/content/data/global';

export const FooterDate = () => (
	<div className="screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
		<Prose>
			<small>
				© {new Date().getFullYear()} –{' '}
				<span className="font-medium text-theme">
					{GLOBAL_DATA.USER.fullName}
				</span>
			</small>
		</Prose>
	</div>
);
