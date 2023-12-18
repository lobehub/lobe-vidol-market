# This is the Market Virtual Store Directory for Vidol.Chat

[Vidol Chat](https://github.com/v-idol/vidol.chat) displays the available product list to users by reading the `index.json` file from this repository.

**English** · [简体中文](./README.zh-CN.md)

## How to Submit an Agent

If you wish to add an Agent to the list, simply add a file under the `agents` folder using the `templates/agent.json`, provide a brief description, and submit a PR to the `main` branch.

### Detailed Submission Guidelines

1. Fork this repository.

2. Make a copy of the `templates/agent.json` file.

3. Fill in the appropriate Agent configuration information.

4. Move it to the `src\agents` folder.

5. Submit the PR, wait for review, and upon merging, the `public/agents/index.json` file will be automatically rebuilt.

- The `created` field will be automatically added, please ensure the uniqueness of `agentId`.
