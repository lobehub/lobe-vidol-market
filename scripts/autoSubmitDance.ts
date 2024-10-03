import { Octokit } from "@octokit/rest";
import { consola } from "consola";
import "dotenv/config";
import { kebabCase } from "lodash-es";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { formatDanceSchema } from "./check";
import { dancesDir, githubHomepage } from "./const";
import { checkHeader, writeJSON } from "./utils";

const GENERATE_LABEL = "💃 Dance PR";
const SUCCESS_LABEL = "✅ Auto Check Pass";
const ERROR_LABEL = "🚨 Auto Check Fail";

class AutoSubmitDance {
  owner = "lobehub";
  repo = "lobe-vidol-market";
  issueNumber = Number(process.env.ISSUE_NUMBER);
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });
  }

  async run() {
    try {
      await this.submit();
    } catch (error) {
      await this.removeLabels(GENERATE_LABEL);
      await this.removeLabels(SUCCESS_LABEL);
      await this.addLabels(ERROR_LABEL);
      await this.createComment(
        [
          "**🚨 Auto Check Fail:**",
          "- Fix error below",
          `- Add issue label \`${GENERATE_LABEL}\` to the current issue`,
          "- Wait for automation to regenerate",
          "```bash",
          error?.message,
          "```",
        ].join("\n")
      );
      consola.error(error);
    }
  }

  async submit() {
    const issue = await this.getIssue();
    if (!issue) return;
    consola.info(`Get issues #${this.issueNumber}`);

    const { dance } = await this.formatIssue(issue);
    const comment = this.genCommentMessage(dance);
    const danceName = dance.danceId;

    const fileName = `${danceName}.json`;
    const filePath = resolve(dancesDir, fileName);

    // check same name
    if (existsSync(filePath)) {
      await this.createComment(
        [
          `**🚨 Auto Check Fail:** Same name exist <${`${githubHomepage}/blob/main/dances/${fileName}`}>`,
          "- Rename your dance identifier",
          `- Add issue label \`${GENERATE_LABEL}\` to the current issue`,
          "- Wait for automation to regenerate",
          "---",
          comment,
        ].join("\n")
      );
      await this.removeLabels(GENERATE_LABEL);
      await this.addLabels(ERROR_LABEL);
      consola.error("Auto Check Fail");
      return;
    }

    // comment in issues
    await this.createComment(comment);
    consola.info(`Auto Check Pass`);

    // commit and pull request
    this.gitCommit(filePath, dance, danceName);
    consola.info("Commit to", `dance/${danceName}`);

    await this.createPullRequest(
      danceName,
      dance.author,
      [
        comment,
        `[@${dance.author}](${dance.homepage}) (resolve #${this.issueNumber})`,
      ].join("\n")
    );
    consola.success("Create PR");

    await this.addLabels(SUCCESS_LABEL);
  }

  gitCommit(filePath, dance, danceName) {
    execSync("git diff");
    execSync('git config --global user.name "lobehubbot"');
    execSync('git config --global user.email "i@lobehub.com"');
    execSync("git pull");
    execSync(`git checkout -b dance/${danceName}`);
    consola.info("Checkout branch");

    // generate file
    writeJSON(filePath, dance);
    consola.info("Generate file", filePath);

    // commit
    execSync("git add -A");
    execSync(
      `git commit -m "💃 chore(auto-submit): Add ${danceName} (#${this.issueNumber})"`
    );
    execSync(`git push origin dance/${danceName}`);
    consola.info("Push dance");
  }

  genCommentMessage(json) {
    return [
      "💃 Automatic generated dance config file",
      "```json",
      JSON.stringify(json, null, 2),
      "```",
    ].join("\n");
  }

  async createPullRequest(danceName, author, body) {
    const { owner, repo, octokit } = this;
    await octokit.pulls.create({
      base: "main",
      body,
      head: `dance/${danceName}`,
      owner: owner,
      repo: repo,
      title: `[DanceSubmit] ${danceName} @${author}`,
    });
  }
  async getIssue() {
    const { owner, repo, octokit, issueNumber } = this;
    const issue = await octokit.issues.get({
      issue_number: issueNumber,
      owner,
      repo,
    });
    return issue.data;
  }

  async addLabels(label) {
    const { owner, repo, octokit, issueNumber } = this;
    await octokit.issues.addLabels({
      issue_number: issueNumber,
      labels: [label],
      owner,
      repo,
    });
  }

  async removeLabels(label) {
    const { owner, repo, octokit, issueNumber } = this;
    const issue = await this.getIssue();

    const baseLabels = issue.labels.map((l) =>
      typeof l === "string" ? l : l.name
    );
    const removeLabels = baseLabels.filter((name) => name === label);

    for (const label of removeLabels) {
      await octokit.issues.removeLabel({
        issue_number: issueNumber,
        name: label,
        owner,
        repo,
      });
    }
  }

  async createComment(body) {
    const { owner, repo, octokit, issueNumber } = this;
    const { data } = await octokit.issues.createComment({
      body,
      issue_number: issueNumber,
      owner,
      repo,
    });
    return data.id;
  }

  markdownToJson(markdown) {
    const lines = markdown.split("\n");
    const json = {};

    let currentKey = "";
    let currentValue = "";

    for (const line of lines) {
      if (checkHeader(line)) {
        if (currentKey && currentValue) {
          json[currentKey] = currentValue.trim();
          currentValue = "";
        }
        currentKey = line.replace("###", "").trim();
      } else {
        currentValue += line + "\n";
      }
    }

    if (currentKey && currentValue) {
      json[currentKey] = currentValue.trim();
    }

    // @ts-ignore
    // json.tags = json.tags.replaceAll('，', ',').replaceAll(', ', ',').split(',').filter(Boolean);

    return json;
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
}

const autoSubmitDance = new AutoSubmitDance();

await autoSubmitDance.run();
