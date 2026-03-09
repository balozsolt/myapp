// passwordData.ts — single source of truth for all password entries
// Both AllItems and SecurityDashboard import from here.

export interface PasswordEntry {
  id: number;
  appName: string;
  url: string;
  username: string;
  password: string;
}

export const passwordEntries: PasswordEntry[] = [
  { id: 1, appName: "GitHub",       url: "https://github.com",         username: "zsolti_dev",              password: "Sup3rS3cur3!gh" },
  { id: 2, appName: "Gmail",        url: "https://mail.google.com",    username: "zsolti@gmail.com",        password: "password123" },
  { id: 3, appName: "AWS Console",  url: "https://aws.amazon.com",     username: "zsolti.aws@company.com",  password: "Aws!Cl0ud#99" },
  { id: 4, appName: "Figma",        url: "https://figma.com",          username: "zsolti_design",           password: "123456" },
  { id: 5, appName: "Jira",         url: "https://atlassian.com",      username: "zsolti@company.com",      password: "J1r@T1ck3ts#" },
];
// Note: "password123" and "123456" are intentionally weak/common so breach detection works in dev.