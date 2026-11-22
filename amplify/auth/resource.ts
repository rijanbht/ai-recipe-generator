import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to Recipe AI!",
      verificationEmailBody: (createCode) =>
        `Enter this code to finish signing up: ${createCode()}`,
    },
  },
});