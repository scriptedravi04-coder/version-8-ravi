import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
async function testModel(modelName) {
  try {
    const res = await ai.models.generateContent({ model: modelName, contents: "test" });
    console.log(modelName, "SUCCESS");
  } catch (e) {
    console.log(modelName, "FAILED:", e.message);
  }
}
async function run() {
  await testModel("gemini-3.5-flash");
  await testModel("gemini-flash-latest");
  await testModel("gemini-pro-latest");
  await testModel("gemini-3.1-flash-lite");
}
run();
