import * as core from "@actions/core";
import * as github from "@actions/github";

import path from "path";

import CheckRun from "./checkrun";

const SEVERITY_MAP = ["notice", "warning", "failure"];

function convertAnnotations(baseDirectory, results) {
  return results.reduce((acc, result) => {
    let pathName = path.relative(baseDirectory, result.filePath);

    return acc.concat(
      result.messages.map(message => {
        let data = {
          path: pathName,
          start_line: message.line,
          end_line: message.endLine,
          annotation_level: SEVERITY_MAP[message.severity],
          message: message.message,
          title: message.ruleId,
        };

        if (message.line == message.endLine) {
          data.start_column = message.column;
          data.end_column = message.endColumn;
        }

        return data;
      })
    );
  }, []);
}

export async function action() {
  if (!process.env.GITHUB_TOKEN) {
    core.warning("You did not pass GITHUB_TOKEN, no annotations will be created");
  }

  let check = new CheckRun("ESLint", github.context, process.env.GITHUB_TOKEN);
  await check.create();

  let baseDir = core.getInput("path");

  let options = {
    configFile: core.getInput("configFile") || null,
    extensions: core.getInput("extensions").split(/,\s*/),
    ignorePath: core.getInput("ignorePath") || null,
  };

  let { CLIEngine } = await import(path.join(process.env.GITHUB_WORKSPACE, "node_modules", "eslint"));

  let cli = new CLIEngine(options);
  let report = cli.executeOnFiles([baseDir]);

  let stylish = cli.getFormatter();
  process.stdout.write(stylish(report.results));

  let annotations = convertAnnotations(baseDir, report.results);
  await check.complete(report.errorCount, report.warningCount, annotations);

  if (report.errorCount > 0) {
    core.setFailed(`${report.errorCount} errors, ${report.warningCount} warnings`);
  }
}

if (process.env.GITHUB_ACTION) {
  action().catch(e => {
    core.setFailed(e);
    console.error(e);
  });
}
