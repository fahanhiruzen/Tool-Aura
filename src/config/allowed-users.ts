/**
 * Only users with these email addresses are allowed to use the plugin.
 */
export const pluginManagementUsers = [
  "appsfactory.mahli@extaccount.com",
  "evelyn.junker@mercedes-benz.com",
];

const allowedSet = new Set(pluginManagementUsers.map((e) => e.toLowerCase()));

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (email == null || typeof email !== "string") return false;
  return allowedSet.has(email.trim().toLowerCase());
}
