import zipfile
import xml.etree.ElementTree as ET

# Extract DOCX text
z = zipfile.ZipFile('Kế hoạch Triển khai Tiêu chuẩn BIM.docx')
data = z.read('word/document.xml')
root = ET.fromstring(data)

ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

# Get paragraphs
paragraphs = []
for p in root.iter(f'{{{ns}}}p'):
    texts = []
    for t in p.iter(f'{{{ns}}}t'):
        if t.text:
            texts.append(t.text)
    line = ''.join(texts).strip()
    if line:
        paragraphs.append(line)

# Write to file
with open('tmp_docx_content.txt', 'w', encoding='utf-8') as f:
    for p in paragraphs:
        f.write(p + '\n')

print(f'Extracted {len(paragraphs)} paragraphs')
print('First 100 paragraphs:')
for i, p in enumerate(paragraphs[:100]):
    print(f'[{i}] {p[:200]}')
