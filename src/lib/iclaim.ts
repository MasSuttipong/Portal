export function buildIClaimUrl(
  baseUrl: string,
  code: string,
  iclaimId: string,
  type: "OPD" | "IPD"
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("code", code);
  url.searchParams.set("id", iclaimId);
  url.searchParams.set("type", type);
  return url.toString();
}
