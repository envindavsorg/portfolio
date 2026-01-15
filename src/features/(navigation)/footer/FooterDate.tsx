import { USER } from '@/lib/user';

const currentYear = new Date().getFullYear();

const FooterDate = () => (
	<>
		<div className="screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 md:max-w-3xl">
			<p className="text-balance text-muted-foreground text-xs">
				© {currentYear} -{' '}
				<span className="font-medium text-theme">
					{USER.lastName} {USER.firstName}
				</span>
			</p>
		</div>
	</>
);

FooterDate.displayName = 'FooterDate';

export { FooterDate };
