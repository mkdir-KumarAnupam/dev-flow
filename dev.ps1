$root = Split-Path -Parent $MyInvocation.MyCommand.Path
node (Join-Path $root "dist\index.js") @args
