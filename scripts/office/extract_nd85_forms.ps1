# extract_nd85_forms.ps1
param (
    [string]$SourceFile = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\ND85.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

Write-Host "Opening $SourceFile..."
$doc = $word.Documents.Open($SourceFile)

# Output directory
$outDir = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\BieuMau_NghiDinh85"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$mauSo = [char]77 + [char]7851 + [char]117 + " " + [char]115 + [char]7889 + " "

$templates = @(
    @{ Name = ($mauSo + "05"); Title = "Mau1_ToTrinhBaoCaoNCKT.docx" },
    @{ Name = ($mauSo + "03"); Title = "Mau2_BCNCKT_NhomA.docx" },
    @{ Name = ($mauSo + "04"); Title = "Mau3_BaoCaoDeXuatChuTruong.docx" },
    @{ Name = ($mauSo + "07"); Title = "Mau4_BaoCaoThamDinh.docx" },
    @{ Name = ($mauSo + "01"); Title = "Mau5_ToTrinhQuyetDinhChuTruong.docx" },
    @{ Name = ($mauSo + "09"); Title = "Mau6_NghiQuyetChuTruong.docx" }
)

foreach ($t in $templates) {
    $rangeStart = $doc.Range()
    $rangeStart.Find.Text = $t.Name
    $rangeStart.Find.Execute() | Out-Null
    
    if ($rangeStart.Find.Found) {
        $startPos = $rangeStart.Start
        Write-Host "Found $($t.Name) at pos $startPos"
        
        # find the next "Mẫu số" or end of doc
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
            
            $outFile = Join-Path $outDir $t.Title
            Write-Host "Saving as $outFile..."
            # Some PowerShell versions hate [ref]$outFile with unicode paths, ascii works.
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
Write-Host "DONE extracting 6 forms."
