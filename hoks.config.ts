import { defineConfig } from "hoks";

export default defineConfig({
    installOnLockChange: true,
    staged: {
        "*": ["eslint --fix", "prettier --write --ignore-unknown"],
    },
    syncBeforePush: true,
    enforceConventionalCommits: true,
});
