# This is the Agent Index of Vidol Chat

[Vidol Chat](https://github.com/v-idol/vidol.chat) accesses [`index.json`](https://github.com/v-idol/vidol-chat-agents/blob/main/index.json) from this repo to show user the list of available agents.

## How to submit agent

If you wish to add an agent onto the index, make an entry in `agents` directory using `agent_template.json`, write a short description then open as a pull request ty!

### Step by step instructions

1. Fork of this repository.

2. Make a copy of `agent_template.json`

3. Fill in the copy and rename it appropriately

4. Move it into `agents` directory

5. Submit a pull request and wait for review.

- Agents pull requests targets [`agents branch`](https://github.com/v-idol/vidol-chat-agents/tree/agents), after merge it is automatically assembled and deployed to [`main branch`](https://github.com/v-idol/vidol-chat-agents/tree/main) using GitHub Actions.

- Don't edit the `index.json` directly and don't modify any other files unless you have a special reason.

- The `created` date will be automatically populated after merge.
