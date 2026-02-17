import { Prose } from '@/components/ui/Typography';
import GLOBAL_DATA from '@/content/data/global';

const currentYear = new Date().getFullYear();

export const FooterDate = () => (
	<>
		<div className="screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
			<Prose>
				© {currentYear} -{' '}
				<span className="font-medium text-theme">
					{GLOBAL_DATA.USER.fullName}
				</span>
			</Prose>
		</div>
	</>
);
