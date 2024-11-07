import { kebabCase } from "lodash-es";
import { resolve } from "node:path";

import { formatAgentJSON } from "../check";
import { agentsDir } from "../const";
import { AutoSubmitBase } from "./AutoSubmitBase";
import consola from "consola";
import { getBuildLocaleAgentFileName } from "../utils";

class AutoSubmitAgent extends AutoSubmitBase {
  protected GENERATE_LABEL = "🤖 Agent PR";
  protected SUCCESS_LABEL = "✅ Auto Check Pass";
  protected ERROR_LABEL = "🚨 Auto Check Fail";
  protected DIRECTORY = agentsDir;

  async submit() {
    const issue = await this.getIssue();
    if (!issue) return;
    consola.info(`Get issues #${this.issueNumber}`);

    const { agent, locale } = await this.formatIssue(issue);
    const comment = this.genCommentMessage(agent);
    const agentName = agent.agentId;

    const fileName = getBuildLocaleAgentFileName(agentName, locale);

    const filePath = resolve(this.DIRECTORY, fileName);

    if (await this.checkExistingFile(fileName, comment)) return;

    await this.createComment(comment);
    consola.info(`Auto Check Pass`);

    this.gitCommit(filePath, agent, agentName);
    consola.info("Commit to", `agent/${agentName}`);

    await this.createPullRequest(
      agentName,
      agent.author,
      [
        comment,
        `[@${agent.author}](${agent.homepage}) (resolve #${this.issueNumber})`,
      ].join("\n")
    );
    consola.success("Create PR");

    await this.addLabels(this.SUCCESS_LABEL);
  }

  async formatIssue(data) {
    const json = this.markdownToJson(data.body) as any;
    const agent = {
      author: data.user.login,
      systemRole: json.systemRole,
      homepage: data.user.html_url,
      agentId: kebabCase(json.agentId),
      greeting: json.greeting,
      meta: {
        name: json.name,
        avatar: json.avatar,
        cover: json.cover,
        description: json.description,
        gender: json.gender,
        model: json.modelUrl,
        category: json.category,
        readme: json.readme,
      },
      tts: json.tts ? JSON.parse(json.tts) : undefined,
      touch: json.touch ? JSON.parse(json.touch) : undefined,
      model: json.model,
      params: json.params ? JSON.parse(json.params) : undefined,
    };
    const locale: string = json.locale;

    return { agent: await formatAgentJSON(agent, locale), locale };
  }

  protected getCommitMessage(name: string): string {
    return `🤖 chore(auto-submit): Add ${name}`;
  }
}

const autoSubmit = new AutoSubmitAgent();

await autoSubmit.run();
