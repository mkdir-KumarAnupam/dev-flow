import { execa } from "execa";

export async function openExternal(target: string) {
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", target] : [target];
  const child = execa(command, args, { reject: false, detached: true, stdio: "ignore" });
  child.unref();
}
