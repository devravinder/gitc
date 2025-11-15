# 🧩 gitc

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A lightweight CLI tool to copy files or folders directly from a GitHub repository using a URL — no need to clone the whole repo!

---

## ✨ Features

* 🚀 Copy **entire repositories**, **folders**, or **single files** from GitHub
* 📂 Specify a **destination folder**
* 🪶 No dependencies on `git` — works via GitHub’s HTTP interface
* 🧱 Built with **Bun** for speed and portability

---

## ⚠️ Note

Currently, `gitc` supports **only GitHub** URLs.
Support for other Git providers (GitLab, Bitbucket, etc.) is planned for future releases.

👉 Contributions are welcome! Feel free to open an issue or raise a PR.

---

## 🛠️ Installation

Install globally using your preferred package manager:

### Using **pnpm**

```bash
pnpm add -g gitc
```

### Using **npm**

```bash
npm install -g gitc
```

### Using **bun**

```bash
bun add -g gitc
```

---

## 💡 Usage

```bash
gitc <git_url> [dest_folder]
```

| Parameter       | Description                                       |
| --------------- | ------------------------------------------------- |
| `<git_url>`     | The GitHub URL of the repo, folder, or file       |
| `[dest_folder]` | (Optional) Folder name to save the copied content |

---

## 🧪 Examples

### 1. Copy an entire repository

```bash
gitc https://github.com/devravinder/images
```

**Copy to a specific folder:**

```bash
gitc https://github.com/devravinder/images pics
```

---

### 2. Copy a folder

```bash
gitc https://github.com/devravinder/react-ts-learn/tree/master/rare-dev-shadcn-registry/registry
```

**Copy to a specific folder:**

```bash
gitc https://github.com/devravinder/react-ts-learn/tree/master/rare-dev-shadcn-registry/registry own-registry
```

---

### 3. Copy a single file

```bash
gitc https://github.com/devravinder/react-ts-learn/blob/master/rare-dev-shadcn-registry/registry.json
```

**Copy to a specific folder:**

```bash
gitc https://github.com/devravinder/react-ts-learn/blob/master/rare-dev-shadcn-registry/registry.json configs
```

---

## 🧰 Development Notes

Steps to build and publish:

1. Initialize project

   ```bash
   bun init
   ```

2. Modify files and update scripts in `package.json`

3. Build

   ```bash
   bun run build
   ```

4. Publish to npm

   ```bash
   bun run push
   # login if needed
   bunx npm login
   ```

---

## 🧑‍💻 Author

**Ravinder Reddy Kothabad**
📦 GitHub: [@devravinder](https://github.com/devravinder)

---

## 📜 License

MIT License © 2025 [devravinder](https://github.com/devravinder)