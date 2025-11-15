import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";


// https://docs.github.com/
// https://api.github.com/

type GitHubInfo = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  type: "blob" | "tree" | "repo";
};

type GitDoc = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
};


const ensureDirectory = async (dirPath: string): Promise<void> => {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
};


const createBaseDir = async (info: GitHubInfo, outputDir: string): Promise<string> => {
  const folderName = info.path ? info.path.split("/").pop() : info.repo;
  const baseDir = join(outputDir, folderName!);
  await mkdir(baseDir, { recursive: true });
  return baseDir;
};

const getRawFileUrl = (info: GitHubInfo, filePath: string): string => {
  return `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${filePath}`;
};


const fetchFileContent = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  return response.text();
};


const writeFileWithDirs = async (filePath: string, content: string): Promise<void> => {
  const fileDir = filePath.substring(0, filePath.lastIndexOf("/"));
  
  if (fileDir) {
    await ensureDirectory(fileDir);
  }
  
  await writeFile(filePath, content);
};


const getRelativeFileName = (filePath: string, prefix: string): string => {
  return prefix ? filePath.substring(prefix.length) : filePath;
};


const fetchRepositoryTree = async (info: GitHubInfo): Promise<GitDoc[]> => {
  const apiUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${info.branch}?recursive=1`;
  console.log(`Fetching repository tree...`);

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch tree: ${response.statusText}`);
  }

  const data = (await response.json()) as { tree: GitDoc[] };
  return data.tree;
};


const filterFilesByFolder = (tree: GitDoc[], prefix: string): GitDoc[] => {
  return tree.filter(
    (item) =>
      item.type === "blob" && (!prefix || item.path.startsWith(prefix))
  );
};


const downloadNestedFile = async (
  file: GitDoc,
  info: GitHubInfo,
  baseDir: string
): Promise<void> => {
  const prefix = info.path ? `${info.path}/` : "";
  const fileName = getRelativeFileName(file.path, prefix);
  const filePath = join(baseDir, fileName);

  const url = getRawFileUrl(info, file.path);
  
  try {
    const content = await fetchFileContent(url);
    await writeFileWithDirs(filePath, content);
    console.log(`✓ ${fileName}`);
  } catch (error) {
    console.error(`✗ Failed to download ${fileName}: ${error}`);
    throw error;
  }
};


const downloadFilesInBatches = async (
  files: GitDoc[],
  info: GitHubInfo,
  baseDir: string,
  batchSize: number = 10
): Promise<void> => {
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(
      batch.map((file) => downloadNestedFile(file, info, baseDir))
    );
  }
};


export const downloadTree = async (info: GitHubInfo, outputDir: string): Promise<void> => {
  try {
    const tree = await fetchRepositoryTree(info);
    const prefix = info.path ? `${info.path}/` : "";
    const files = filterFilesByFolder(tree, prefix);
    
    console.log(`Found ${files.length} files to download`);

    const baseDir = await createBaseDir(info, outputDir);
    await downloadFilesInBatches(files, info, baseDir);

    console.log(`\n✓ Successfully downloaded to: ${baseDir}`);
  } catch (error) {
    console.error(`✗ Error downloading tree: ${error}`);
    throw error;
  }
};


export const downloadFile = async (info: GitHubInfo, outputDir: string): Promise<void> => {
  console.log(`Downloading file: ${info.path}`);

  try {
    const url = getRawFileUrl(info, info.path);
    const content = await fetchFileContent(url);

    const fileName = info.path.split("/").pop() || "download";
    const filePath = join(outputDir, fileName);

    await writeFileWithDirs(filePath, content);
    console.log(`✓ Downloaded: ${fileName}`);
  } catch (error) {
    console.error(`✗ Error downloading file: ${error}`);
    throw error;
  }
};


export const parseGitHubUrl = (url: string): GitHubInfo => {
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
    type: !type ? "repo" : type === "blob" ? "blob" : "tree",
  };
};