import io
import os
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader


def extract_text_from_pdf(source):
    """
    Extract text from a PDF file path or raw bytes/BytesIO.
    Handles per-page extraction and common PDF decoding anomalies gracefully.
    """
    try:
        if isinstance(source, (bytes, bytearray)):
            stream = io.BytesIO(source)
        elif isinstance(source, io.BytesIO):
            stream = source
        else:
            stream = open(source, "rb")

        reader = PdfReader(stream)
        text_parts = []

        for page in reader.pages:
            try:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            except Exception:
                continue

        if not isinstance(source, (bytes, bytearray, io.BytesIO)):
            try:
                stream.close()
            except Exception:
                pass

        return "\n".join(text_parts).strip()
    except Exception:
        return ""


def extract_text_from_docx(source):
    """
    Extract text from a DOCX (Word) file path or raw bytes/BytesIO using standard zipfile and XML.
    """
    try:
        if isinstance(source, (bytes, bytearray)):
            stream = io.BytesIO(source)
        elif isinstance(source, io.BytesIO):
            stream = source
        else:
            stream = open(source, "rb")

        with zipfile.ZipFile(stream) as docx_zip:
            xml_content = docx_zip.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paragraphs = []

            for p in tree.iterfind(".//w:p", namespaces):
                texts = [node.text for node in p.iterfind(".//w:t", namespaces) if node.text]
                if texts:
                    paragraphs.append("".join(texts))

            result = "\n".join(paragraphs).strip()

        if not isinstance(source, (bytes, bytearray, io.BytesIO)):
            try:
                stream.close()
            except Exception:
                pass

        return result
    except Exception:
        return ""


def extract_text_from_txt(source):
    """
    Extract text from a plain text file path or raw bytes.
    """
    if isinstance(source, (bytes, bytearray)):
        raw_bytes = bytes(source)
    elif isinstance(source, io.BytesIO):
        raw_bytes = source.getvalue()
    else:
        try:
            with open(source, "rb") as f:
                raw_bytes = f.read()
        except Exception:
            return ""

    for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            return raw_bytes.decode(encoding).strip()
        except (UnicodeDecodeError, LookupError):
            continue

    return ""


def extract_document_text(filename, source):
    """
    Unified extractor: auto-detects PDF, DOCX, or TXT format by magic bytes
    and file extension, extracting clean text.
    """
    clean_name = os.path.basename((filename or "").strip().strip("\"'"))
    suffix = os.path.splitext(clean_name)[1].lower()

    # Peek initial bytes if source is bytes or byte-like
    header = b""
    if isinstance(source, (bytes, bytearray)):
        header = source[:16]
    elif isinstance(source, io.BytesIO):
        pos = source.tell()
        header = source.read(16)
        source.seek(pos)
    elif isinstance(source, str) and os.path.exists(source):
        try:
            with open(source, "rb") as f:
                header = f.read(16)
        except Exception:
            pass

    # 1. Check if PDF (by magic bytes %PDF or .pdf extension)
    is_pdf = header.startswith(b"%PDF") or b"%PDF" in header or suffix == ".pdf"
    if is_pdf:
        text = extract_text_from_pdf(source)
        if text:
            return text

    # 2. Check if DOCX (by ZIP magic bytes PK\x03\x04 or .docx extension)
    is_docx = header.startswith(b"PK\x03\x04") or suffix in (".docx", ".doc")
    if is_docx:
        text = extract_text_from_docx(source)
        if text:
            return text

    # 3. Plain text / markdown
    if suffix in (".txt", ".text", ".md", ".rtf") or not suffix:
        text = extract_text_from_txt(source)
        if text:
            return text

    # 4. Fallback attempts in order
    for fn in (extract_text_from_pdf, extract_text_from_docx, extract_text_from_txt):
        try:
            text = fn(source)
            if text:
                return text
        except Exception:
            continue

    return ""