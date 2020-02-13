import * as core from "@actions/core";
import * as aws from "aws-sdk";
import fs from "fs";

async function run() {
  try {
    const functionName = core.getInput("function-name");
    const zipPackage = core.getInput("zip-package");

    const awsAccessKeyId = core.getInput("aws-access-key-id");
    const awsSecretAccessKey = core.getInput("aws-secret-access-key");
    const awsRegion = core.getInput("aws-region");
    const awsRole = core.getInput("aws-role");
    const awsProfile = core.getInput("aws-profile");

    console.log(`Deploying ${functionName}...`);

    var zipBuffer = fs.readFileSync(`./${zipPackage}`);
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
  } catch (error) {
    core.setFailed(error.message);
  }
}

export default run;

run();
