import { inngest } from "./index";
import {
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations
} from "./aiFunctions";

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }: any) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

// Add the function to the exported array:
export const functions = [
  helloWorld,
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
];