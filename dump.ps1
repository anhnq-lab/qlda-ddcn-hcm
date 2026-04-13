Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = "d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\ND254.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$text = $xml -replace '<[^>]+>',''

$matches = [regex]::Matches($text, '.{0,10}M[^\s]{0,5}u s[^\s]{0,5}\s*.{0,5}')
foreach($m in $matches) {
    Write-Host $m.Value
}
