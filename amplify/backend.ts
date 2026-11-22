import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({ auth, data });

const region = "us-east-1";
const modelId = "anthropic.claude-haiku-4-5-20251001-v1:0";
const account = Stack.of(backend.data.resources.graphqlApi).account;
const profileArn =
  `arn:aws:bedrock:${region}:${account}:inference-profile/global.${modelId}`;

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  `https://bedrock-runtime.${region}.amazonaws.com`,
  {
    authorizationConfig: {
      signingRegion: region,
      signingServiceName: "bedrock",
    },
  },
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ["bedrock:InvokeModel"],
    resources: [
      profileArn,
      `arn:aws:bedrock:${region}::foundation-model/${modelId}`,
      `arn:aws:bedrock:::foundation-model/${modelId}`,
    ],
  }),
);