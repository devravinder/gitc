import { downloadFile, downloadTree, parseGitHubUrl } from "./github";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: gitc <github-url>");
    console.error("\nExamples:");
    console.error("  gitc https://github.com/user/repo");
    console.error("  gitc https://github.com/user/repo/tree/main/folder");
    console.error("  gitc https://github.com/user/repo/blob/main/file.js");
    process.exit(1);
  }

  const url = args[0]!;
  const outputDir = args[1]! || process.cwd();

  try {
    const info = parseGitHubUrl(url);
    console.log(`Repository: ${info.owner}/${info.repo}`);
    console.log(`Branch: ${info.branch}`);
    console.log(`Type: ${info.type}`);
    if (info.path) console.log(`Path: ${info.path}`);
    console.log();

    if (info.type === "blob") {
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
