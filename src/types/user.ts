export type User = {
	firstName: string;
	lastName: string;
	displayName: string;
	username: string;
	gender: string;
	pronouns: string;
	bio: string;
	flipSentences: string[];
	address: string;
	location: {
		city: string;
		zoom: {
			max: number;
			min: number;
			default: number;
			step: number;
		};
		latitude: number;
		longitude: number;
	};
	phoneNumber: string;
	email: string;
	website: string;
	jobTitle: string;
	jobs: {
		title: string;
		company: string;
		website: string;
	}[];
	about: string;
	photo: string;
	avatar: string;
	ogImage: string;
	namePronunciationUrl: string;
	documents: {
		cv: {
			content: string;
			url: string;
			name: string;
			title: string;
		};
	};
	keywords: string[];
	dateCreated: string;
};
