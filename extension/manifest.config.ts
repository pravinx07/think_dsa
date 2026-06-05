import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "ThinkDSA",
  version: "1.0.0",
  description: "Learn DSA by thinking, not memorizing.",

  permissions: [
    "storage",
    "activeTab",
  ],

  host_permissions: [
    "https://leetcode.com/*",
  ],

  content_scripts: [
    {
      matches: [
        "https://leetcode.com/problems/*",
      ],
      js: ["src/content/content.tsx"],
    },
  ],
});