# 这是 Vidol.Chat 的 Agent 目录

[Vidol Chat](https://github.com/v-idol/vidol.chat) 通过从这个仓库中读取 [`index.json`](https://github.com/v-idol/vidol-chat-agents/blob/main/index.json) 文件来给用户显示可用的 Agent 列表。

**简体中文** · [English](./README.md)

## 如何提交 Agent

如果你希望在列表中添加一个 Agent, 用 `agent_template.json` 在 `agents` 文件夹下添加一个文件, 添加一些简短的描述文件，然后添加一个 PR 到 `agents` 分支即可。

### 详细步骤指引

1. Fork 这个仓库。

2. 复制一份 `agent_template.json` 文件。

3. 填入合适的 Agent 配置信息。

4. 将其移动到 `agents` 文件夹下。

5. 提交 PR，等待 Review，合并后会自动重新构建 index.json 文件。

- 不要直接编辑 `index.json` 文件也不要动其他文件。

- PR 分支指向 [`agents 分支`](https://github.com/v-idol/vidol-chat-agents/tree/agents), 合并之后 GitHub Actions 会自动集成并部署到 [`main 分支`](https://github.com/v-idol/vidol-chat-agents/tree/main)。

- `created` 创建日期字段会自动添加。
