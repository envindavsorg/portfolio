import { NextResponse } from "next/server";

import GLOBAL_DATA from "@/data/global";

export const dynamic = "force-static";

// CV machine-readable au format JSON Resume (https://jsonresume.org).
export const GET = (): NextResponse => {
  const resume = {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      email: GLOBAL_DATA.USER.emailAddress,
      label: GLOBAL_DATA.WORK.title,
      location: {
        city: GLOBAL_DATA.USER.location.city,
        countryCode: "FR",
      },
      name: GLOBAL_DATA.USER.fullName,
      phone: GLOBAL_DATA.USER.phoneNumber,
      profiles: [
        {
          network: "GitHub",
          url: GLOBAL_DATA.SOCIAL.github,
          username: GLOBAL_DATA.USER.username,
        },
        {
          network: "LinkedIn",
          url: GLOBAL_DATA.SOCIAL.linkedin,
        },
      ],
      summary: GLOBAL_DATA.USER.description,
      url: GLOBAL_DATA.SOCIAL.portfolio,
    },
    work: GLOBAL_DATA.WORK.jobs.map((job) => ({
      name: job.company,
      position: job.title,
      url: job.website,
    })),
  };

  return NextResponse.json(resume, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
