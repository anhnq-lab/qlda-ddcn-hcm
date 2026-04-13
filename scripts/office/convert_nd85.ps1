$word = New-Object -ComObject Word.Application
$word.Visible = $false

$docPath = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\85_2025_ND-CP_651162.doc"
$docxPath = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\85_2025_ND-CP_651162.docx"

Write-Host "Opening $docPath..."
$doc = $word.Documents.Open($docPath)

Write-Host "Saving as $docxPath..."
$doc.SaveAs([ref]$docxPath, [ref]16)

$doc.Close()
$word.Quit()
Write-Host "Done converting to DOCX."
