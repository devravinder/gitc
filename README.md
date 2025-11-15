# gitc

A simple tool(command) to copy files from git repo using url.

## Note:-

Currently it supports only Github, in future we may provide support for other git serivice providers.
Feel free to raise a PR

## How to use

1. install with any package manager
   - `pnpm add -g gitc`
   - `npm i -g gitc`
   - `bun add -g gitc`

2. copy
   1. entire repo
     ```gitc  https://github.com/devravinder/images```
   2. sub folder
      ```gitc https://github.com/devravinder/react-ts-learn/tree/master/rare-dev-shadcn-registry/registry```
   3. specific file
      ```gitc https://github.com/devravinder/react-ts-learn/blob/master/rare-dev-shadcn-registry/registry.json```

## How I started

1. `bun init`
2. changed files & added the necessary scripts in package.json
3. `bun run build`
4. `bun run push`
   - login if needed `bunx npm login`
