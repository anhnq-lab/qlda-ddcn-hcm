import os
from win32com import client

doc_path = r"d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\85_2025_ND-CP_651162.doc"
docx_path = r"d:\QuocAnh\2026\01.Project\qlda-ddcn-hcm\resources\Phap luat\85_2025_ND-CP_651162.docx"

def convert_doc_to_docx():
    word = client.Dispatch("Word.Application")
    word.Visible = False
    
    # Open the document
    print(f"Opening {doc_path}...")
    doc = word.Documents.Open(doc_path)
    
    # Save as docx (Format 16)
    print(f"Saving as {docx_path}...")
    doc.SaveAs2(docx_path, FileFormat=16)
    
    doc.Close()
    word.Quit()
    print("Done converting.")

if __name__ == "__main__":
    convert_doc_to_docx()
