# @nx-squeezer/workspace:github-workflow

Setup command:

```shell
nx g @nx-squeezer/workspace:github-workflow
```

Adds a [GitHub Action workflow](https://docs.github.com/en/actions/using-workflows) to automate the CI pipeline for your repo. It includes the following actions:

- Checkout.
- Setup Node.
- Install dependencies.
- Targets for `build`, `test`, `lint`, `e2e`.
- Configure `nx.json`.
- Workflow adapted to Nx workspaces.
- Add a badge to `README.md`.

Options:

- Force overwriting of workflow with `--force` (default `false`).
- Provide default branch with `--branch=master` (default `main`).
- Use [Nx Cloud](https://nx.app) `--useNxCloud` (default `true`).
