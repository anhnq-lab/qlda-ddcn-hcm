# extract_nd254_all.ps1
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

# We find all "Mẫu số " in the text and get their positions.
# M = 77, ẫ = 7851, u = 117
$mauSo = [char]77 + [char]7851 + [char]117 + " " + [char]115 + [char]7889 + " "

$findObj = $doc.Content.Find
$findObj.Text = $mauSo
$findObj.MatchWholeWord = $false

$positions = @()
$range = $doc.Content
while ($range.Find.Execute()) {
    # Get the text right after to know the name (e.g. 01.a)
    $nameRange = $doc.Range($range.End, $range.End + 15)
    $nameText = ($nameRange.Text -replace "[`r`n\t]", "") -replace "\s+", ""
    # Extract just the prefix like 01.a or 05.a/
    $match = [regex]::Match($nameText, '^[0-9]+[a-zA-Z\.\/]*')
    $cleanName = "Unknown"
    if ($match.Success) {
        $cleanName = $match.Value -replace '[\/\\:\*\?"<>\|]', '_'
    }
    
    $obj = New-Object PSObject -Property @{
        Start = $range.Start
        End = $range.End
        Title = "Mau_$cleanName"
    }
    $positions += $obj
    
    $range.Start = $range.End
    $range.End = $doc.Content.End
}

Write-Host "Found $($positions.Count) bounds."

# Now extract them
for ($i = 0; $i -lt $positions.Count; $i++) {
    $startPos = $positions[$i].Start
    $endPos = $doc.Content.End
    if ($i -lt $positions.Count - 1) {
        $endPos = $positions[$i + 1].Start - 1
    }
    
    $title = $positions[$i].Title
    
    try {
        $copyRange = $doc.Range($startPos, $endPos)
        $copyRange.Copy()
        
        $newDoc = $word.Documents.Add()
        $newDoc.PageSetup.PaperSize = 7 # wdPaperA4
        
        $pasteRange = $newDoc.Range(0, 0)
        $pasteRange.Paste()
        
        $outFile = Join-Path $outDir ($title + ".docx")
        
        # Prevent overwriting if multiple have same prefix
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
