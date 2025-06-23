import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const prNumber = searchParams.get("prNumber");
  if (!owner || !repo || !prNumber) {
    return NextResponse.json(
      { error: "Missing query parameters" },
      { status: 400 }
    );
  }
  const token = cookies().get("github_access_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const diffRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    }
  );
  if (!diffRes.ok) {
    const errorText = await diffRes.text();
    return NextResponse.json(
      { error: `GitHub API error: ${diffRes.status} ${errorText}` },
      { status: diffRes.status }
    );
  }
  const diffText = await diffRes.text();
  return new NextResponse(diffText, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}