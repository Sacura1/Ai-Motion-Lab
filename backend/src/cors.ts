export function sameOrigin(candidate: string, configuredSite: string) {
  try {
    return new URL(candidate).origin === new URL(configuredSite).origin;
  } catch {
    return false;
  }
}
