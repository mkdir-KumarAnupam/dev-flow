import { renderProfile } from "../profile/renderProfile.js";

export async function profileCommand() {
  await renderProfile();
}

