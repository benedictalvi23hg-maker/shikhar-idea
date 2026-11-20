$toolsDir = "d:\clg wrks\tools"
$pyZip = Join-Path $toolsDir "py_embed.zip"
$pyUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"
$pyTarget = Join-Path $toolsDir "python"

if (-not (Test-Path $pyTarget)) {
    New-Item -ItemType Directory -Path $pyTarget -Force
}

Write-Host "Downloading Python Embeddable..."
Invoke-WebRequest -Uri $pyUrl -OutFile $pyZip -UseBasicParsing

Write-Host "Extracting Python..."
Expand-Archive -Path $pyZip -DestinationPath $pyTarget -Force
Remove-Item $pyZip -Force

# Enable site-packages in ._pth file
$pthFile = Get-ChildItem -Path $pyTarget -Filter "*._pth" | Select-Object -First 1
if ($pthFile) {
    $content = Get-Content $pthFile.FullName
    $content = $content -replace '#import site', 'import site'
    Set-Content -Path $pthFile.FullName -Value $content
}

# Download get-pip.py
$getPip = Join-Path $pyTarget "get-pip.py"
Write-Host "Downloading get-pip.py..."
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $getPip -UseBasicParsing

Write-Host "Installing pip..."
& "$pyTarget\python.exe" $getPip --no-warn-script-location
Remove-Item $getPip -Force

Write-Host "Testing Python and pip..."
& "$pyTarget\python.exe" --version
& "$pyTarget\Scripts\pip.exe" --version
Write-Host "Python setup finished successfully!"
