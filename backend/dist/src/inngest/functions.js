"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = void 0;
const index_1 = require("./index");
const helloWorld = index_1.inngest.createFunction({ id: "hello-world" }, { event: "test/hello.world" }, async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
});
// Add the function to the exported array:
exports.functions = [
    helloWorld
];
