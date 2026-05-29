Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  using System.Text;
  public class WindowTracker {
      [DllImport("user32.dll")]
      public static extern IntPtr GetForegroundWindow();

      [DllImport("user32.dll", SetLastError=true)]
      public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

      [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
      public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

      public static uint GetActiveProcessId() {
          IntPtr hWnd = GetForegroundWindow();
          if (hWnd == IntPtr.Zero) return 0;
          uint pId;
          GetWindowThreadProcessId(hWnd, out pId);
          return pId;
      }

      public static string GetActiveWindowTitle() {
          IntPtr hWnd = GetForegroundWindow();
          if (hWnd == IntPtr.Zero) return "";
          StringBuilder sb = new StringBuilder(256);
          GetWindowText(hWnd, sb, 256);
          return sb.ToString();
      }
  }
"@

while ($true) {
    $targetPid = [WindowTracker]::GetActiveProcessId()
    $title = [WindowTracker]::GetActiveWindowTitle()
    if ($targetPid -ne 0) {
        try {
            $process = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Output "$($process.ProcessName)|$title"
            } else {
                Write-Output "idle|idle"
            }
        } catch {
            Write-Output "idle|idle"
        }
    } else {
        Write-Output "idle|idle"
    }
    Start-Sleep -Seconds 2
}
