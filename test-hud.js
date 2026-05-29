import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";

async function test() {
  const cwd = process.cwd();
  
  const psScript = `
Set-Location -Path "${cwd}"
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$width = 800
$height = 100
$x = [Math]::Max(0, [int](($screen.Width - $width) / 2))
$y = [Math]::Max(0, [int]($screen.Height - $height))

$code = @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    [DllImport("kernel32.dll")]
    public static extern IntPtr GetConsoleWindow();
}
"@
Add-Type -TypeDefinition $code -Language CSharp
$hwnd = [Win32]::GetConsoleWindow()
[Win32]::SetWindowPos($hwnd, new-object IntPtr(-1), $x, $y, $width, $height, 0x0040)

Write-Output "HUD UI SETUP DONE!"
Start-Sleep -Seconds 2
`;

  const tmpFile = path.join(os.tmpdir(), `launch-hud-test.ps1`);
  await fs.writeFile(tmpFile, psScript);

  await execa("powershell", [
    "-NoProfile",
    "-Command",
    `Start-Process powershell -ArgumentList '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', '${tmpFile}'`
  ]);
  
  console.log("Spawned");
}

test();
