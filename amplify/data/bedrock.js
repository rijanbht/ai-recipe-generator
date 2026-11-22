import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const ingredients = ctx.args.ingredients ?? [];
  const prompt = `Suggest a simple recipe using these ingredients: ${ingredients.join(", ")}. Include an ingredient list and numbered cooking instructions.`;

  return {
    method: "POST",
    resourcePath: "/model/global.anthropic.claude-haiku-4-5-20251001-v1:0/invoke",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  if (ctx.result.statusCode !== 200) {
    util.error(`Bedrock returned HTTP ${ctx.result.statusCode}.`);
  }

  const result = JSON.parse(ctx.result.body);
  return { body: result.content[0].text };
}