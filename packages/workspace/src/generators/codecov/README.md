# @nx-squeezer/workspace:codecov

Setup command:

```shell
nx g @nx-squeezer/workspace:codecov
```

Adds [`codecov`](https://docs.codecov.com/docs) to a project to have coverage information, including:

- Generating [configuration file `.codecov.yml`](https://docs.codecov.com/docs/codecov-yaml).
- Configures individual projects with `test` target to expose coverage information.
- Updates CI file to upload coverage report.
- Adds badge to README.md.
