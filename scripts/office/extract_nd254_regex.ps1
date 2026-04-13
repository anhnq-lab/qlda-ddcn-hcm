# extract_nd254_regex.ps1
param (
    [string]$SourceFile = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\ND254.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

Write-Host "Opening $SourceFile..."
$doc = $word.Documents.Open($SourceFile)

$outDir = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\BieuMau_NghiDinh254"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$text = $doc.Content.Text
Write-Host "Text length: $($text.Length)"

# Match "Mẫu số " handling precomposed/decomposed and weird spacing
$matches = [regex]::Matches($text, 'M[^\s]{0,5}u s[^\s]{0,5}\s*([0-9]+[a-zA-Z\.\/]*)')

Write-Host "Found $($matches.Count) forms."

for ($i = 0; $i -lt $matches.Count; $i++) {
    $m = $matches[$i]
    $startPos = $m.Index
    $endPos = $doc.Content.End
    
    if ($i -lt $matches.Count - 1) {
        $endPos = $matches[$i+1].Index - 1
    }
    
    $cleanName = ($m.Groups[1].Value -replace '[\/\\:\*\?"<>\|]', '_').Trim()
    if ([string]::IsNullOrWhiteSpace($cleanName)) { $cleanName = "Unknown_$i" }
    
    $title = "Mau_$cleanName"
    
    try {
        # Account for possible range mismatch offset
        if ($startPos -ge $doc.Content.End) { $startPos = $doc.Content.End - 10 }
        if ($endPos -ge $doc.Content.End) { $endPos = $doc.Content.End }
        if ($startPos -lt 0) { $startPos = 0 }
        
        $copyRange = $doc.Range($startPos, $endPos)
        $copyRange.Copy()
        
        $newDoc = $word.Documents.Add()
        $newDoc.PageSetup.PaperSize = 7 # wdPaperA4
        
        $pasteRange = $newDoc.Range(0, 0)
        $pasteRange.Paste()
        
        $outFile = Join-Path $outDir ($title + ".docx")
        
        $counter = 1
        while (Test-Path $outFile) {
            $outFile = Join-Path $outDir ($title + "_$counter.docx")
            $counter++
        }
        
        Write-Host "Saving as $outFile..."
        $newDoc.SaveAs([ref]((Get-Item -LiteralPath $outDir).FullName + "\" + (Split-Path $outFile -Leaf)), [ref]16)
        $newDoc.Close(0)
    } catch {
        Write-Host "Error saving $($title): $_"
    }
}

$doc.Close(0)
$word.Quit()
Write-Host "DONE extracting ND254 forms dynamically."
