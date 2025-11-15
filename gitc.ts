import { downloadFile, downloadTree, parseGitHubUrl } from "./github/github";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: bun script.ts <github-url>");
    console.error("\nExamples:");
    console.error("  bun script.ts https://github.com/user/repo");
    console.error(
      "  bun script.ts https://github.com/user/repo/tree/main/folder"
    );
    console.error(
      "  bun script.ts https://github.com/user/repo/blob/main/file.js"
    );
    process.exit(1);
  }

  const url = args[0]!;
  const outputDir = process.cwd();

  console.log({ url });

  try {
    const info = parseGitHubUrl(url);
    console.log(`Repository: ${info.owner}/${info.repo}`);
    console.log(`Branch: ${info.branch}`);
    console.log(`Type: ${info.type}`);
    if (info.path) console.log(`Path: ${info.path}`);
    console.log();

    if (info.type === "file") {
      await downloadFile(info, outputDir);
    } else {
      await downloadTree(info, outputDir);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

main();
