import zipfile
import xml.etree.ElementTree as ET
import sys
import traceback

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        paras = []
        for p in tree.iter():
            if p.tag.endswith('}p'):
                texts = [node.text for node in p.iter() if node.tag.endswith('}t') and node.text]
                if texts:
                    paras.append(''.join(texts))
        
        with open('extract_docx.txt', 'w', encoding='utf-8') as f:
            f.write('\n'.join(paras))
        print(f"Extracted {len(paras)} paragraphs.")
    except Exception as e:
        print("Error:")
        traceback.print_exc()

if __name__ == '__main__':
    extract_text('d:\\QuocAnh\\2026\\01.Project\\qlda-ddcn-hcm\\Bao_Gia_CIC_QLDA_2026_Official_v3.docx')
