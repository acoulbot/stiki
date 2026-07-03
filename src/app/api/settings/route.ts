import { getSiteSettings } from "@/lib/siteSettings";

export async function GET() {
  const settings = await getSiteSettings();

  return Response.json({
    disableUserEmailVerification: settings.disableUserEmailVerification,
    disableCheckoutEmailVerification: settings.disableCheckoutEmailVerification,
  });
}
