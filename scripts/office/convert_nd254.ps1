# convert_nd254.ps1
$SourceFile = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\PL_ND254.doc"
$docxPath = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\ND254.docx"

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

Write-Host "Opening $SourceFile..."
try {
    # Open ReadOnly to try bypassing Protected View if unblock doesn't work natively
    $doc = $word.Documents.Open($SourceFile, $false, $true)
    Write-Host "Saving as $docxPath..."
    $doc.SaveAs([ref]$docxPath, [ref]16)
    $doc.Close(0)
    Write-Host "Done converting."
} catch {
    Write-Host "Error: $_"
} finally {
    $word.Quit()
}
