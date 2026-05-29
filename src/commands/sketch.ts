import chalk from "chalk";
import inquirer from "inquirer";
import { detectCurrentContext } from "../continuity/contextDetection.js";
import { readLocalSession } from "../sessions/sessionRegistry.js";
import { createOrOpenSketch } from "../sketches/sketches.js";
import { saveSketchToRegistry } from "../registry/sketches.js";
import { openExternal } from "../utils/openExternal.js";

export async function sketchCommand(title?: string) {
  const context = await detectCurrentContext();
  const session = await readLocalSession(context.path);
  const sketch = await createOrOpenSketch({
    context,
    sessionId: session?.id,
    title,
  });

  await openExternal(sketch.url);

  const hasStoredLink = sketch.url !== "https://excalidraw.com";
  let nextUrl = "";

  if (hasStoredLink) {
    const { updateLink } = await inquirer.prompt<{ updateLink: boolean }>([
      {
        type: "confirm",
        name: "updateLink",
        message: "Update the stored share link?",
        default: false,
      },
    ]);

    if (updateLink) {
      const { shareUrl } = await inquirer.prompt<{ shareUrl: string }>([
        {
          type: "input",
          name: "shareUrl",
          message: "Paste updated Excalidraw share link:",
          default: sketch.url,
        },
      ]);

      nextUrl = shareUrl.trim();
    }
  } else {
    const { shareUrl } = await inquirer.prompt<{ shareUrl: string }>([
      {
        type: "input",
        name: "shareUrl",
        message: "Paste Excalidraw share link (press enter to skip):",
        default: "",
      },
    ]);

    nextUrl = shareUrl.trim();
  }

  if (nextUrl && nextUrl !== sketch.url) {
    const updated = {
      ...sketch,
      url: nextUrl,
      updatedAt: new Date().toISOString(),
    };

    await saveSketchToRegistry(updated);
  }

  console.log(chalk.cyan(`Sketch ready: ${sketch.title}`));
  if (nextUrl) {
    console.log(chalk.dim(`Stored share link: ${nextUrl}`));
  } else if (sketch.url !== "https://excalidraw.com") {
    console.log(chalk.dim(`Stored share link: ${sketch.url}`));
  } else {
    console.log(chalk.dim("No share link stored yet. Run `dev sketch` again to attach one."));
  }
}
