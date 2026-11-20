[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$toolsDir = "d:\clg wrks\tools"

$nodeZip = Join-Path $toolsDir "node.zip"
$nodeUrl = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"

Write-Host "Downloading Node.js..."
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing

Write-Host "Extracting Node.js..."
Expand-Archive -Path $nodeZip -DestinationPath $toolsDir -Force
if (Test-Path (Join-Path $toolsDir "nodejs")) {
    Remove-Item (Join-Path $toolsDir "nodejs") -Recurse -Force
}
Rename-Item -Path (Join-Path $toolsDir "node-v20.18.0-win-x64") -NewName "nodejs" -Force
Remove-Item $nodeZip -Force

Write-Host "Testing Node.js..."
& "$toolsDir\nodejs\node.exe" --version
& "$toolsDir\nodejs\npm.cmd" --version

$pyInstaller = Join-Path $toolsDir "python_setup.exe"
$pyUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe"
$pyTarget = Join-Path $toolsDir "python"

Write-Host "Downloading Python 3.11..."
Invoke-WebRequest -Uri $pyUrl -OutFile $pyInstaller -UseBasicParsing

Write-Host "Installing Python silently to $pyTarget..."
$proc = Start-Process -FilePath $pyInstaller -ArgumentList "/quiet TargetDir=`"$pyTarget`" InstallAllUsers=0 Include_pip=1 Shortcuts=0 PrependPath=0 Include_test=0" -Wait -PassThru
Write-Host "Python installer exit code: $($proc.ExitCode)"
Remove-Item $pyInstaller -Force

Write-Host "Testing Python..."
& "$pyTarget\python.exe" --version
& "$pyTarget\Scripts\pip.exe" --version
Write-Host "Setup complete!"
