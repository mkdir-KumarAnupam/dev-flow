import { watchCurrentSandbox } from "../runners/runSandbox.js";

export async function watchCommand() {
  await watchCurrentSandbox();
}
