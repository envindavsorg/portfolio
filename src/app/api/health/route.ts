import { NextResponse } from "next/server";

export const runtime = "edge";

const headers = {
  "Cache-Control": "public, max-age=300, s-maxage=300",
  "Content-Type": "text/plain",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Health-Status": "OK",
} as const;

export const GET = (): NextResponse =>
  new NextResponse("OK", { headers, status: 200 });
