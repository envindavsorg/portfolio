import type { ElementType } from 'react';

declare global {
	interface USER {
		firstName: string;
		lastName: string;
		fullName: string;
		username: string;
		gender: string;
		pronouns: string;
		bio: string;
		phoneNumber: string;
		emailAddress: string;
		location: {
			city: string;
		};
		photo: string;
		avatar: string;
		og: string;
		pronunciation: string;
	}

	interface OVERVIEW {
		sentences: string[];
		content: {
			id: string;
			content: string;
			icon: ElementType;
			className: string;
		}[];
	}

	interface SOCIAL {
		github: string;
		linkedin: string;
		portfolio: string;
	}

	interface WORK {
		title: string;
		jobs: {
			title: string;
			company: string;
			website: string;
		}[];
	}

	interface CV {
		url: string;
		name: string;
	}
}
