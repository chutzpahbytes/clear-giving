# Clear Giving - one-time fix script
# Run this from the project folder (the one that contains package.json).
# It (1) fixes the build so the site can be deployed, and
#    (2) removes placeholder blockchain files that could be mistaken for a real deployment.

$ErrorActionPreference = 'Stop'

if (-not (Test-Path 'package.json')) {
  Write-Host 'ERROR: package.json not found. Open PowerShell in the project folder and try again.' -ForegroundColor Red
  exit 1
}

# 1) Delete three unused files that stop the build
$dead = @(
  'src\components\EvidenceWorkbench.tsx',
  'src\components\TrustPassportCard.tsx',
  'src\lib\services\chainService.ts'
)
foreach ($f in $dead) {
  if (Test-Path $f) { Remove-Item -Force $f; Write-Host "Removed $f" }
}

# 2) Add one missing import so the build passes
$p = 'src\lib\services\types.ts'
$t = Get-Content $p -Raw
if ($t -notmatch 'EvidenceItem,') {
  $t = $t.Replace('  EvidenceMetadata,', "  EvidenceItem,`n  EvidenceMetadata,")
  Set-Content -Path $p -Value $t -NoNewline
  Write-Host 'Fixed import in src\lib\services\types.ts'
}

# 3) Remove placeholder "deployment" files (they contain made-up contract addresses)
$fake = @(
  'src\contracts\deployment.json',
  'src\lib\contracts\deploymentConfig.json',
  'scripts\deployToAmoy.js'
)
foreach ($f in $fake) {
  if (Test-Path $f) { Remove-Item -Force $f; Write-Host "Removed $f" }
}

# 4) Make the Chain Mode button honest
$shell = 'src\components\AppShell.tsx'
$s = Get-Content $shell -Raw
$s = $s.Replace('Polygon Amoy (Chain Mode)', 'Chain preview (not connected yet)')
$s = $s.Replace('Toggle between Client Simulator and Polygon Amoy Smart Contract', 'Preview of the planned switch to a blockchain. The demo currently runs on the simulator.')
Set-Content -Path $shell -Value $s -NoNewline
Write-Host 'Updated Chain Mode label'

Write-Host ''
Write-Host 'Done. Now run:  npm run build   (it should finish without errors)' -ForegroundColor Green
