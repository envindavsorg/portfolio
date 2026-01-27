declare global {
  interface USER {
    firstName: string;
    lastName: string;
    fullName: string;
    username: string;
    gender: string;
    pronouns: string;
    bio: string;
    description: string;
    phoneNumber: string;
    emailAddress: string;
    location: {
      city: string;
    };
    photo: string;
    avatar: string;
    og: string;
    pronunciation: string;
    welcome: string;
  }

  interface OVERVIEW {
    sentences: string[];
  }

  interface SOCIAL {
    github: string;
    linkedin: string;
    portfolio: string;
  }

  interface WORK {
    title: string;
    experience: string;
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

export {};
