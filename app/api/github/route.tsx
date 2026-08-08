import { redirect } from "next/navigation";

export async function GET() {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        scope: "read:user repo",
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    });

    redirect(`https://github.com/login/oauth/authorize?${params}`);
}
