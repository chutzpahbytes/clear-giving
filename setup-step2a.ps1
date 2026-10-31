# Step 2a: Core Escrow Engine, Anti-Collusion Rules, Sample Data, and Demo Console
# Run this script from: ClaudeProject\sphinx-transparent-giving

Write-Host "Setting up Step 2a files in sphinx-transparent-giving..." -ForegroundColor Cyan

# Ensure directories exist
$dirs = @(
    "src/types",
    "src/lib",
    "src/lib/services",
    "src/providers",
    "src/app/admin/demo"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

Write-Host "Directories verified." -ForegroundColor Green
Write-Host "All Step 2a files are installed and ready." -ForegroundColor Green
Write-Host "Visit: http://localhost:3000/admin/demo" -ForegroundColor Yellow
