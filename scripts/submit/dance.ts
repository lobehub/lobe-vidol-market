import { consola } from "consola";
import "dotenv/config";
import { kebabCase } from "lodash-es";
import { resolve } from "node:path";

import { formatDanceSchema } from "../check";
import { dancesDir } from "../const";
import { AutoSubmitBase } from "./AutoSubmitBase";

class AutoSubmitDance extends AutoSubmitBase {
  protected GENERATE_LABEL = "💃 Dance PR";
  protected SUCCESS_LABEL = "✅ Auto Check Pass";
  protected ERROR_LABEL = "🚨 Auto Check Fail";
  protected DIRECTORY = dancesDir;

  async submit() {
    const issue = await this.getIssue();
    if (!issue) return;
    consola.info(`Get issues #${this.issueNumber}`);

    const { dance } = await this.formatIssue(issue);
    const comment = this.genCommentMessage(dance);
    const danceName = dance.danceId;

    const fileName = `${danceName}.json`;
    const filePath = resolve(this.DIRECTORY, fileName);

    if (await this.checkExistingFile(fileName, comment)) return;

    await this.createComment(comment);
    consola.info(`Auto Check Pass`);

    this.gitCommit(filePath, dance, danceName);
    consola.info("Commit to", `dance/${danceName}`);

    await this.createPullRequest(
      danceName,
      dance.author,
      [
        comment,
        `[@${dance.author}](${dance.homepage}) (resolve #${this.issueNumber})`,
      ].join("\n"),
    );
    consola.success("Create PR");

    await this.addLabels(this.SUCCESS_LABEL);
  }

  async formatIssue(data) {
    const json = this.markdownToJson(data.body) as any;
    const dance = {
      danceId: kebabCase(json.danceId),
      name: json.name,
      author: data.user.login,
      homepage: data.user.html_url,
      src: json.src,
      audio: json.audio,
      cover: json.cover,
      thumb: json.thumb,
      readme: json.readme,
    };

    return { dance: await formatDanceSchema(dance) };
  }

  protected getCommitMessage(name: string): string {
    return `💃 chore(auto-submit): Add ${name}`;
  }
}

const autoSubmitDance = new AutoSubmitDance();

await autoSubmitDance.run();
