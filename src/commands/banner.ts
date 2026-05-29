import { playLaunchSequence, renderCreationMap, renderDevHeader } from "../ui/terminalArt.js";

export async function bannerCommand() {
  renderDevHeader();
  renderCreationMap("portfolio-dashboard");
}

export async function bannerMotionCommand() {
  await playLaunchSequence();
  renderCreationMap("portfolio-dashboard");
}
