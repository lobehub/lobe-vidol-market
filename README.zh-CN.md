# 这是 Vidol.Chat 的 Market 虚拟商店目录

[Vidol Chat](https://github.com/v-idol/vidol.chat) 通过从这个仓库中读取 `index.json` 文件来给用户显示可用的商品列表。

**简体中文** · [English](./README.md)

## 如何提交 Agent

如果你希望在列表中添加一个 Agent, 用 `templates/agent.json` 在 `agents` 文件夹下添加一个文件, 添加一些简短的描述，然后添加一个 PR 到 `main` 分支即可。

### 详细步骤指引

1. Fork 这个仓库。

2. 复制一份 `templates/agent.json` 文件。

3. 填入合适的 Agent 配置信息。

4. 将其移动到 `src\agents` 文件夹下。

5. 提交 PR，等待 Review，合并后会自动重新构建 `public/agents/index.json` 文件。

## 如何提交 Dance

同上，只不过文件夹改为 `templates/dance.json`

## 格式化 JSON

如果需要在本地运行 `format` 脚本，需要配置相应的环境变量：

| 环境变量           | 类型 | 示例                 |
| ------------------ | ---- | -------------------- |
| `OPENAI_API_KEY`   | 必选 | `sk-xxxxxx...xxxxxx` |
| `OPENAI_PROXY_URL` | 可选 | `-`                  |
