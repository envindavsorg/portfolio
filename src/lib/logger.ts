import { Logger } from 'tslog';

export const logger = new Logger({
	name: 'mon portfolio',
	type: 'pretty',
	minLevel: process.env.NODE_ENV === 'production' ? 3 : 0,
});
