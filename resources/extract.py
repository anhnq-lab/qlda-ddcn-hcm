import PyPDF2
try:
    with open(r'd:/01_Projects/qlda-ddcn-hcm/resources/Tài liệu Quy trình/210qd_200103042043signed.pdf', 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for i, page in enumerate(reader.pages):
            extracted = page.extract_text()
            if extracted: text += f"--- Page {i+1} ---\n" + extracted + "\n"
    with open(r'd:/01_Projects/qlda-ddcn-hcm/resources/tmp_210qd_2.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Success, pages:", len(reader.pages))
    print("Total chars:", len(text))
except Exception as e:
    print("Error:", e)
