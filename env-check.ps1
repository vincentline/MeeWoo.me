# ... existing code ...
# Environment & project check (ASCII-only)

$ErrorActionPreference = 'SilentlyContinue'

function CommandPath($name) {
  try { (Get-Command $name -ErrorAction Stop).Path } catch { $null }
}

function TryVersion($exe, $arg) {
  try {
    $out = & $exe $arg 2>$null
    if ($out) { ($out | Out-String).Trim() } else { $null }
  } catch { $null }
}

function AddLine($text) { Write-Output $text }

AddLine "=== Environment Check ==="

# Node.js
$nodePath = CommandPath 'node'
if ($nodePath) {
  $nodeVer = TryVersion $nodePath '-v'
  AddLine "[OK] Node.js - Path=$nodePath; Version=$nodeVer"
} else {
  AddLine "[MISSING] Node.js - 'node' not found in PATH"
}

# npm
$npmPath = CommandPath 'npm'
if ($npmPath) {
  $npmVer = TryVersion $npmPath '-v'
  $npmRegistry = (& $npmPath 'config' 'get' 'registry') 2>$null
  AddLine "[OK] npm - Path=$npmPath; Version=$npmVer; Registry=$npmRegistry"
} else {
  AddLine "[MISSING] npm - 'npm' not found in PATH"
}

# Optional tools
$wingetPath = CommandPath 'winget'
AddLine ((if ($wingetPath) { "[OK] winget(optional) - Path=$wingetPath" } else { "[SKIP] winget(optional) - not found" }))

$yarnPath = CommandPath 'yarn'
AddLine ((if ($yarnPath) { "[OK] yarn(optional) - Path=$yarnPath; Version=$(TryVersion $yarnPath '-v')" } else { "[SKIP] yarn(optional) - not found" }))

$pnpmPath = CommandPath 'pnpm'
AddLine ((if ($pnpmPath) { "[OK] pnpm(optional) - Path=$pnpmPath; Version=$(TryVersion $pnpmPath '-v')" } else { "[SKIP] pnpm(optional) - not found" }))

# Project check
$cwd = Get-Location
$pkgPath = Join-Path $cwd 'package.json'
if (Test-Path $pkgPath) {
  try { $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json } catch { $pkg = $null }
  $name = $pkg.name
  $devScript = $pkg.scripts.dev
  $buildScript = $pkg.scripts.build
  $vuepressDep = $pkg.devDependencies.vuepress
  $elementUiDep = $pkg.dependencies.'element-ui'
  AddLine "[OK] project(package.json) - name=$name; dev=$devScript; build=$buildScript; vuepress(devDep)=$vuepressDep; element-ui=$elementUiDep"

  $nodeModulesPath = Join-Path $cwd 'node_modules'
  if (Test-Path $nodeModulesPath) {
    $vuepressPkg = Join-Path $nodeModulesPath 'vuepress\package.json'
    if (Test-Path $vuepressPkg) {
      try { $vpJson = Get-Content $vuepressPkg -Raw | ConvertFrom-Json; $vpVer = $vpJson.version } catch { $vpVer = $null }
      AddLine "[OK] vuepress(local) - version=$vpVer"
    } else {
      AddLine "[WARN] vuepress(local) - not found in node_modules"
    }
  } else {
    AddLine "[WARN] node_modules - not found (dependencies may not be installed)"
  }
} else {
  AddLine "[WARN] project(package.json) - not found in current directory"
}

AddLine ""
AddLine "=== Next steps ==="
if (-not $nodePath) {
  AddLine "1) Install Node.js LTS, then reopen terminal"
} elseif (-not $npmPath) {
  AddLine "1) Fix npm in PATH (reinstall Node.js), then reopen terminal"
}

if (Test-Path $pkgPath) {
  $nodeModulesPath = Join-Path $cwd 'node_modules'
  if (-not (Test-Path $nodeModulesPath)) {
    AddLine "2) Run: npm install"
  } else {
    $vuepressPkg = Join-Path $cwd 'node_modules\vuepress\package.json'
    if (-not (Test-Path $vuepressPkg)) {
      AddLine "2) vuepress not found locally: run npm install"
    }
  }
  AddLine "3) Start dev: npm run dev"
} else {
  AddLine "2) Please run this script in the project root directory"
}

AddLine ""
Read-Host "Press Enter to exit..."
# ... existing code ...