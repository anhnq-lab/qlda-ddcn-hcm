# extract_nd254_forms.ps1
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

$mauSo = [char]77 + [char]7851 + [char]117 + " " + [char]115 + [char]7889 + " "

$templates = @(
    @{ Name = ($mauSo + "2"); Title = "Mau37_ToTrinhKHLCNT.docx" },
    @{ Name = ($mauSo + "3A"); Title = "Mau38_BaoCaoThamDinhKHLCNT_3A.docx" },
    @{ Name = ($mauSo + "3B"); Title = "Mau38_BaoCaoThamDinhKHLCNT_3B.docx" },
    @{ Name = ($mauSo + "4"); Title = "Mau39_QuyetDinhPheDuyetKHLCNT.docx" },
    @{ Name = ($mauSo + "5"); Title = "Mau40_PhieuDanhGiaHSMT.docx" },
    @{ Name = ($mauSo + "6"); Title = "Mau41_BaoCaoDanhGiaHSDT.docx" },
    @{ Name = ($mauSo + "7"); Title = "Mau42_ToTrinhKQLCNT.docx" },
    @{ Name = ($mauSo + "8"); Title = "Mau43_BaoCaoThamDinhKQLCNT.docx" },
    @{ Name = ($mauSo + "9"); Title = "Mau44_QuyetDinhPheDuyetKQLCNT.docx" }
)

foreach ($t in $templates) {
    $rangeStart = $doc.Range()
    $rangeStart.Find.Text = $t.Name
    $rangeStart.Find.MatchWholeWord = $true
    $rangeStart.Find.Execute() | Out-Null
    
    if ($rangeStart.Find.Found) {
        $startPos = $rangeStart.Start
        Write-Host "Found $($t.Name) at pos $startPos"
        
        # We need to find the next "Mẫu số" or end of doc
        $rangeEnd = $doc.Range($rangeStart.End, $doc.Range().End)
        $rangeEnd.Find.Text = $mauSo
        $rangeEnd.Find.Execute() | Out-Null
        
        $endPos = $doc.Range().End
        if ($rangeEnd.Find.Found) {
            $endPos = $rangeEnd.Start - 1
        }
        
        if ($startPos -ge $endPos) {
            $endPos = $doc.Range().End
        }
        
        try {
            $copyRange = $doc.Range($startPos, $endPos)
            $copyRange.Copy()
            
            $newDoc = $word.Documents.Add()
            $newDoc.PageSetup.PaperSize = 7 # wdPaperA4
            
            $pasteRange = $newDoc.Range(0, 0)
            $pasteRange.Paste()
            
            # Using ascii name
            $outFile = Join-Path $outDir $t.Title
            Write-Host "Saving as $outFile..."
            $newDoc.SaveAs([ref]((Get-Item -LiteralPath $outDir).FullName + "\" + $t.Title), [ref]16)
            $newDoc.Close(0)
            Write-Host "Successfully saved $($t.Title)"
        } catch {
            Write-Host "Error saving $($t.Name): $_"
        }
    } else {
        Write-Host "WARNING: Could not find $($t.Name)"
    }
}

$doc.Close(0)
$word.Quit()
Write-Host "DONE extracting ND254 forms."
