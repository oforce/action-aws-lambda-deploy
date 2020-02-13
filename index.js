import * as core from "@actions/core";
import * as aws from "aws-sdk";
import fs from "fs";
// import * as github from "@actions/github";
// import * as exec from "@actions/exec";

async function run() {
  const functionName = core.getInput("function-name");
  const artifact = core.getInput("artifact");
  const runTime = core.getInput("runtime");
  const handler = core.getInput("handler");
  const type = core.getInput("type");

  const awsRole = core.getInput("aws-role");
  const awsAccessKeyId = core.getInput("aws-access-key-id");
  const awsSecretAccessKey = core.getInput("aws-secret-access-key");
  const awsRegion = core.getInput("aws-region");

  console.log(`Deploying ${functionName} from ${artifact}.`);

  var zipBuffer = fs.readFileSync(`./${artifact}`);
  core.debug("ZIP file put into memory buffer.");

  const lambda = new aws.Lambda({
    apiVersion: "2015-03-31",
    region: awsRegion,
    secretAccessKey: awsSecretAccessKey,
    accessKeyId: awsAccessKeyId,
    maxRetries: 3,
    sslEnabled: true,
    logger: console
  });

  if (type === "create") {
    const params = {
      FunctionName: functionName,
      Publish: true,
      Runtime: runTime,
      Handler: handler,
      ZipFile: zipBuffer,
      Role: awsRole
    };
    lambda.createFunction(params, err => {
      if (err) {
        console.error(err);
        core.setFailed(err);
      }
    });
  } else {
    const params = {
      FunctionName: functionName,
      Publish: true,
      ZipFile: zipBuffer
    };
    lambda.updateFunctionCode(params, err => {
      if (err) {
        console.error(err);
        core.setFailed(err);
      }
    });
  }
}

export default run;

run();
