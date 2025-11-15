# gitc

A simple tool(command) to copy files from git repo using url

## How to use

1. install with any package manager
   - `pnpm add -g gitc`
   - `npm i -g gitc`
   - `bun add -g gitc`

2. copy
   1. entire repo
     ```gitc  https://github.com/devravinder/notes```
   2. sub folder
      ```gitc https://github.com/devravinder/notes/tree/master/IDEs```
   3. specific file
      ```gitc https://github.com/devravinder/notes/blob/master/IDEs/eclipse.txt```

## How I started

1. `bun init`
2. changed files & added the necessary scripts in package.json
3. `bun run build`
4. `bun run push`
   - login if needed `bunx npm login`
