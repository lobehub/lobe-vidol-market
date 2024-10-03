import { Octokit } from "@octokit/rest";
import { consola } from "consola";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { githubHomepage } from "../const";
import { checkHeader, writeJSON } from "../utils";

export abstract class AutoSubmitBase {
  owner = "lobehub";
  repo = "lobe-vidol-market";
  issueNumber = Number(process.env.ISSUE_NUMBER);
  protected octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });
  }

  abstract submit(): Promise<void>;
  abstract formatIssue(data: any): Promise<any>;

  async run() {
    try {
      await this.submit();
    } catch (error) {
      await this.removeLabels(this.GENERATE_LABEL);
      await this.removeLabels(this.SUCCESS_LABEL);
      await this.addLabels(this.ERROR_LABEL);
      await this.createComment(
        [
          `**🚨 Auto Check Fail:**`,
          "- Fix error below",
          `- Add issue label \`${this.GENERATE_LABEL}\` to the current issue`,
          "- Wait for automation to regenerate",
          "```bash",
          error?.message,
          "```",
        ].join("\n")
      );
      consola.error(error);
    }
  }

  protected abstract get GENERATE_LABEL(): string;
  protected abstract get SUCCESS_LABEL(): string;
  protected abstract get ERROR_LABEL(): string;
  protected abstract get DIRECTORY(): string;

  protected async checkExistingFile(fileName: string, comment: string) {
    const filePath = resolve(this.DIRECTORY, fileName);
    if (existsSync(filePath)) {
      await this.createComment(
        [
          `**🚨 Auto Check Fail:** Same name exist <${`${githubHomepage}/blob/main/${this.DIRECTORY.split("/").pop()}/${fileName}`}>`,
          `- Rename your identifier`,
          `- Add issue label \`${this.GENERATE_LABEL}\` to the current issue`,
          "- Wait for automation to regenerate",
          "---",
          comment,
        ].join("\n")
      );
      await this.removeLabels(this.GENERATE_LABEL);
      await this.addLabels(this.ERROR_LABEL);
      consola.error("Auto Check Fail");
      return true;
    }
    return false;
  }

  protected gitCommit(filePath: string, data: any, name: string) {
    execSync("git diff");
    execSync('git config --global user.name "lobehubbot"');
    execSync('git config --global user.email "i@lobehub.com"');
    execSync("git pull");
    execSync(`git checkout -b ${this.DIRECTORY.split("/").pop()}/${name}`);
    consola.info("Checkout branch");

    writeJSON(filePath, data);
    consola.info("Generate file", filePath);

    execSync("git add -A");
    execSync(
      `git commit -m "${this.getCommitMessage(name)} (#${this.issueNumber})"`
    );
    execSync(`git push origin ${this.DIRECTORY.split("/").pop()}/${name}`);
    consola.info(`Push ${this.DIRECTORY.split("/").pop()}`);
  }

  protected abstract getCommitMessage(name: string): string;

  protected genCommentMessage(json: any) {
    return [
      `🤖 Automatic generated ${this.DIRECTORY.split("/").pop()} config file`,
      "```json",
      JSON.stringify(json, null, 2),
      "```",
    ].join("\n");
  }

  protected async createPullRequest(
    name: string,
    author: string,
    body: string
  ) {
    const { owner, repo, octokit } = this;
    await octokit.pulls.create({
      base: "main",
      body,
      head: `${this.DIRECTORY.split("/").pop()}/${name}`,
      owner: owner,
      repo: repo,
      title: `[${this.DIRECTORY.split("/").pop()}Submit] ${name} @${author}`,
    });
  }

  protected async getIssue() {
    const { owner, repo, octokit, issueNumber } = this;
    const issue = await octokit.issues.get({
      issue_number: issueNumber,
      owner,
      repo,
    });
    return issue.data;
  }

  protected async addLabels(label: string) {
    const { owner, repo, octokit, issueNumber } = this;
    await octokit.issues.addLabels({
      issue_number: issueNumber,
      labels: [label],
      owner,
      repo,
    });
  }

  protected async removeLabels(label: string) {
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

  protected async createComment(body: string) {
    const { owner, repo, octokit, issueNumber } = this;
    const { data } = await octokit.issues.createComment({
      body,
      issue_number: issueNumber,
      owner,
      repo,
    });
    return data.id;
  }

  protected markdownToJson(markdown: string) {
    const lines = markdown.split("\n");
    const json: Record<string, string> = {};

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

    return json;
  }
}
