import { join } from "path";
import { mkdir, writeFile } from "fs/promises";

// https://docs.github.com/
// https://api.github.com/

type GitHubInfo = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  type: "file" | "tree" | "repo";
};

type GitDoc = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
};

const parseGitHubUrl = (url: string): GitHubInfo => {
  const regex =
    /github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:(blob|tree)\/([^\/]+)\/?(.*)))?/;
  const match = url.match(regex);

  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const [, owner, repo, type, branch, path] = match as [
    string,
    string,
    string,
    string,
    string,
    string
  ];

  // If no type specified, it's the entire repo
  return {
    owner,
    repo,
    branch: branch || "main",
    path: path || "",
    type: !type ? "repo" : type === "blob" ? "file" : "tree",
  };
};

const downloadFile = async (info: GitHubInfo, outputDir: string) => {
  const url = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${info.path}`;
  console.log(`Downloading file: ${info.path}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const content = await response.text();
    
    const fileName = info.path.split("/").pop() || "download";
    const filePath = join(outputDir, fileName);

    await writeFile(filePath, content);
    console.log(`✓ Downloaded: ${fileName}`);
  } catch (error) {
    console.error(`✗ Error downloading file: ${error}`);
    throw error;
  }
};

const createDir = async (info: GitHubInfo, outputDir: string) => {
  const folderName = info.path ? info.path.split("/").pop() : info.repo;
  const baseDir = join(outputDir, folderName!);
  await mkdir(baseDir, { recursive: true });
  return baseDir;
};

const getFiles = async (info: GitHubInfo) => {
  const apiUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${info.branch}?recursive=1`;
  console.log(`Fetching repository tree...`);

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch tree: ${response.statusText}`);
  }

  const data = (await response.json()) as { tree: GitDoc[] };
  const tree = data.tree;

  // Filter files based on path prefix
  const prefix = info.path ? `${info.path}/` : "";
  const files = tree.filter(
    (item: any) =>
      item.type === "blob" && (!prefix || item.path.startsWith(prefix))
  );

  return files;
};

const downloadNestedFile = async (
  file: GitDoc,
  info: GitHubInfo,
  baseDir: string
) => {
  const prefix = info.path ? `${info.path}/` : "";

  const fileName = prefix ? file.path.substring(prefix.length) : file.path;
  const filePath = join(baseDir, fileName);

  const fileDir = filePath.substring(0, filePath.lastIndexOf("/"));

  // Create directory if needed
  if (fileDir !== baseDir) {
    await mkdir(fileDir, { recursive: true });
  }

  // Download file content
  const url = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${file.path}`;
  const response = await fetch(url);
  if (response.ok) {
    const content = await response.text();
    await writeFile(filePath, content);
    console.log(`✓ ${fileName}`);
  }
};
const downloadTree = async (info: GitHubInfo, outputDir: string) => {
  try {
    const files = await getFiles(info);
    console.log(`Found ${files.length} files to download`);

    const baseDir = await createDir(info, outputDir);

    // Download files concurrently (in batches to avoid rate limiting)
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(
        batch.map((file)=>downloadNestedFile(file,info, baseDir))
      );
    }

    console.log(`\n✓ Successfully downloaded to: ${baseDir}`);
  } catch (error) {
    console.error(`✗ Error downloading tree: ${error}`);
    throw error;
  }
};

//===========

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
