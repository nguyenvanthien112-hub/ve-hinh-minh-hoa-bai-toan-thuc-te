/**
 * docxWordExporter.ts
 * Tạo file Word (.docx) chứa công thức toán học chuẩn OMML (Word Equation)
 * Chạy 100% trên trình duyệt qua jszip, không cần server.
 *
 * Dùng cho dự án: Vẽ Hình Minh Hoạ Toán Thực Tế 5.0
 * Tác giả: Nguyễn Thiện
 */

import JSZip from 'jszip';
import { latexToOmml } from './latexToOmml';
import { downloadBlob } from './exporter';

// ─────────────── XML TEMPLATES ───────────────

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`;

const DOC_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
    Target="styles.xml"/>
  <Relationship Id="rId2"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings"
    Target="settings.xml"/>
</Relationships>`;

const SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
  <m:mathPr>
    <m:mathFont m:val="Cambria Math"/>
    <m:brkBin m:val="before"/>
    <m:brkBinSub m:val="--"/>
    <m:smallFrac m:val="0"/>
    <m:dispDef/>
    <m:lMargin m:val="0"/>
    <m:rMargin m:val="0"/>
    <m:defJc m:val="centerGroup"/>
    <m:wrapIndent m:val="1440"/>
    <m:intLim m:val="subSup"/>
    <m:naryLim m:val="undOvr"/>
  </m:mathPr>
</w:settings>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
        <w:lang w:val="vi-VN"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="0D9488"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="26"/>
      <w:color w:val="0F766E"/>
    </w:rPr>
  </w:style>
</w:styles>`;

// ─────────────── HELPERS ───────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tạo run văn bản bình thường */
function textRun(text: string, bold = false, color?: string): string {
  if (!text) return '';
  const colorEl = color ? `<w:color w:val="${color}"/>` : '';
  const boldEl = bold ? '<w:b/>' : '';
  return `<w:r><w:rPr>${boldEl}${colorEl}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

/** Nhận dạng inline $...$ và $$...$$ trong một dòng, trả về chuỗi XML Word */
function parseLineToWordXml(line: string): string {
  // Chia thành từng phần: văn bản thường và công thức
  const parts = line.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  let xml = '';

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      // Display math — wrap trong oMathPara
      const latex = part.slice(2, -2).trim();
      xml += `<m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">${latexToOmml(latex)}</m:oMathPara>`;
    } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      // Inline math
      const latex = part.slice(1, -1).trim();
      xml += latexToOmml(latex);
    } else {
      // Văn bản thường — xử lý **bold**
      const subParts = part.split(/(\*\*[^*]+\*\*)/g);
      for (const sp of subParts) {
        if (sp.startsWith('**') && sp.endsWith('**')) {
          xml += textRun(sp.slice(2, -2), true);
        } else {
          xml += textRun(sp);
        }
      }
    }
  }
  return xml;
}

/** Tạo paragraph Word */
function makeParagraph(content: string, indent = 0): string {
  const indentXml = indent > 0 ? `<w:ind w:left="${indent}"/>` : '';
  return `<w:p>
    <w:pPr>
      <w:spacing w:line="360" w:lineRule="auto"/>
      ${indentXml}
    </w:pPr>
    ${content}
  </w:p>`;
}

/** Tạo heading paragraph (## hoặc ###) */
function makeHeading(text: string, level: 1 | 2): string {
  const styleId = level === 1 ? 'Heading1' : 'Heading2';
  const fontSize = level === 1 ? '28' : '26';
  const color = level === 1 ? '0D9488' : '0F766E';
  return `<w:p>
    <w:pPr>
      <w:pStyle w:val="${styleId}"/>
      <w:spacing w:before="${level === 1 ? '240' : '180'}" w:after="${level === 1 ? '120' : '80'}"/>
    </w:pPr>
    <w:r>
      <w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${fontSize}"/></w:rPr>
      <w:t>${esc(text)}</w:t>
    </w:r>
  </w:p>`;
}

/** Tạo đường kẻ ngang */
function makeHRule(): string {
  return `<w:p>
    <w:pPr>
      <w:pBdr>
        <w:bottom w:val="single" w:sz="6" w:space="1" w:color="D1D5DB"/>
      </w:pBdr>
    </w:pPr>
  </w:p>`;
}

/** Xây dựng nội dung body từ văn bản markdown thuần */
function buildBodyXml(title: string, content: string): string {
  let body = '';

  // Tiêu đề chính
  if (title) {
    body += `<w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="200"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:color w:val="0D9488"/>
          <w:sz w:val="32"/>
        </w:rPr>
        <w:t>${esc(title)}</w:t>
      </w:r>
    </w:p>`;
    body += makeHRule();
  }

  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Dòng trống → paragraph rỗng
      body += '<w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>';
      i++;
      continue;
    }

    // ## Heading 1
    if (trimmed.startsWith('## ')) {
      body += makeHeading(trimmed.slice(3), 1);
      i++;
      continue;
    }

    // ### Heading 2
    if (trimmed.startsWith('### ')) {
      body += makeHeading(trimmed.slice(4), 2);
      i++;
      continue;
    }

    // Dòng ngang ---
    if (/^-{3,}$/.test(trimmed)) {
      body += makeHRule();
      i++;
      continue;
    }

    // Danh sách - item
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.slice(2);
      const content = '• ' + parseLineToWordXml(itemText);
      body += makeParagraph(content.replace('• ', textRun('• ')), 360);
      i++;
      continue;
    }

    // Danh sách số 1. item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const itemContent = textRun(numMatch[1] + '. ') + parseLineToWordXml(numMatch[2]);
      body += makeParagraph(itemContent, 360);
      i++;
      continue;
    }

    // Công thức display math dạng $$...$$  (riêng 1 dòng)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      const latex = trimmed.slice(2, -2).trim();
      body += `<w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:line="360" w:lineRule="auto"/>
        </w:pPr>
        ${latexToOmml(latex)}
      </w:p>`;
      i++;
      continue;
    }

    // Dòng văn bản thông thường (có thể chứa $inline$ math)
    const lineXml = parseLineToWordXml(trimmed);
    body += makeParagraph(lineXml);
    i++;
  }

  return body;
}

// ─────────────── PUBLIC API ───────────────

export interface WordExportOptions {
  /** Tiêu đề hiển thị ở đầu file Word */
  title?: string;
  /** Nội dung văn bản, hỗ trợ Markdown đơn giản và $LaTeX$ inline */
  content: string;
  /** Tên file tải về (không cần đuôi .docx) */
  fileName?: string;
}

/**
 * Tạo và tải file Word (.docx) chứa công thức toán OMML chuẩn Microsoft Office.
 * Chạy 100% trên trình duyệt, không cần server.
 */
export async function exportSolutionToDocx(opts: WordExportOptions): Promise<void> {
  const { title = 'Lời giải', content, fileName = 'loi-giai' } = opts;

  const bodyXml = buildBodyXml(title, content);

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  mc:Ignorable="w14 w15">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', CONTENT_TYPES_XML);
  zip.file('_rels/.rels', RELS_XML);
  zip.file('word/_rels/document.xml.rels', DOC_RELS_XML);
  zip.file('word/document.xml', documentXml);
  zip.file('word/styles.xml', STYLES_XML);
  zip.file('word/settings.xml', SETTINGS_XML);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  downloadBlob(blob, fileName.replace(/\.docx$/, '') + '.docx');
}
