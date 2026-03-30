# Dark Mode Fixer - Based on RULES.md Section 5
# Fixes ALL dark:bg-slate-* opacity violations in .tsx files

$featureDir = "d:\01_Projects\qlda-ddcn-hcm\features"
$componentDir = "d:\01_Projects\qlda-ddcn-hcm\components"
$layoutDir = "d:\01_Projects\qlda-ddcn-hcm\layouts"

$dirs = @($featureDir, $componentDir, $layoutDir)
$totalReplacements = 0

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) { continue }
    
    $files = Get-ChildItem -Path $dir -Recurse -Include "*.tsx" -File
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $original = $content
        
        # === RULE 5.2: NO opacity for dark:bg-slate-* backgrounds ===
        
        # dark:bg-slate-800/XX → dark:bg-slate-800 (any opacity)
        $content = $content -replace 'dark:bg-slate-800/\d+', 'dark:bg-slate-800'
        
        # dark:bg-slate-900/XX → dark:bg-slate-900 (any opacity, except for color semantics)
        # Only fix neutral backgrounds, NOT semantic colors like dark:bg-blue-900/20
        $content = $content -replace 'dark:bg-slate-900/\d+', 'dark:bg-slate-900'
        
        # dark:bg-slate-700/XX → dark:bg-slate-700
        $content = $content -replace 'dark:bg-slate-700/\d+', 'dark:bg-slate-700'
        
        # === RULE 5.3: hover must have dark:hover with NO opacity ===
        $content = $content -replace 'dark:hover:bg-slate-700/\d+', 'dark:hover:bg-slate-700'
        $content = $content -replace 'dark:hover:bg-slate-800/\d+', 'dark:hover:bg-slate-800'
        
        if ($content -ne $original) {
            Set-Content $file.FullName -Value $content -NoNewline -Encoding UTF8
            $totalReplacements++
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Cyan
Write-Host "Total files fixed: $totalReplacements" -ForegroundColor Cyan
