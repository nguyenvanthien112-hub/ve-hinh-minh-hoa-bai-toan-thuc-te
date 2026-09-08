/**
 * latexToOmml.ts
 * Chuyển đổi chuỗi LaTeX → chuỗi XML OMML (Office Math Markup Language)
 * Chuẩn OMML là định dạng toán học Word Equation dùng bởi Microsoft Word 2007+
 * Chạy 100% trên trình duyệt, không cần server.
 *
 * Tác giả: Nguyễn Thiện (tích hợp cho dự án Vẽ Hình Minh Hoạ Toán Thực Tế 5.0)
 */

const NS_M = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
const NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/** Escape XML đặc biệt */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tạo element XML đơn giản */
function el(tag: string, inner: string, attrs = ''): string {
  return `<m:${tag}${attrs ? ' ' + attrs : ''}>${inner}</m:${tag}>`;
}

/** Tạo run toán học chứa text */
function mRun(text: string, italic = true): string {
  const rPr = italic
    ? el('rPr', el('sty', '', 'm:val="i"'))
    : el('rPr', el('sty', '', 'm:val="p"'));
  return el('r', rPr + el('t', esc(text)));
}

/** Bảng ký hiệu LaTeX → ký tự Unicode */
const SYMBOLS: Record<string, string> = {
  // Chữ Hy Lạp thường
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
  '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η',
  '\\theta': 'θ', '\\vartheta': 'ϑ', '\\iota': 'ι', '\\kappa': 'κ',
  '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ',
  '\\pi': 'π', '\\varpi': 'ϖ', '\\rho': 'ρ', '\\varrho': 'ϱ',
  '\\sigma': 'σ', '\\varsigma': 'ς', '\\tau': 'τ', '\\upsilon': 'υ',
  '\\phi': 'φ', '\\varphi': 'φ', '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
  // Chữ Hy Lạp hoa
  '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
  '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Upsilon': 'Υ',
  '\\Phi': 'Φ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
  // Toán tử quan hệ
  '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
  '\\neq': '≠', '\\ne': '≠', '\\approx': '≈', '\\equiv': '≡',
  '\\sim': '∼', '\\simeq': '≃', '\\cong': '≅', '\\propto': '∝',
  // Toán tử tập hợp
  '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
  '\\subseteq': '⊆', '\\supseteq': '⊇', '\\cap': '∩', '\\cup': '∪',
  '\\emptyset': '∅', '\\varnothing': '∅',
  // Toán tử số học & giải tích
  '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\div': '÷',
  '\\cdot': '·', '\\cdots': '⋯', '\\ldots': '…', '\\vdots': '⋮',
  '\\ddots': '⋱', '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
  '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
  '\\sum': 'Σ', '\\prod': 'Π', '\\int': '∫', '\\oint': '∮',
  '\\iint': '∬', '\\iiint': '∭',
  '\\lim': 'lim', '\\log': 'log', '\\ln': 'ln', '\\exp': 'exp',
  '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan',
  '\\cot': 'cot', '\\sec': 'sec', '\\csc': 'csc',
  '\\arcsin': 'arcsin', '\\arccos': 'arccos', '\\arctan': 'arctan',
  '\\max': 'max', '\\min': 'min', '\\sup': 'sup', '\\inf': 'inf',
  '\\det': 'det', '\\deg': 'deg', '\\dim': 'dim',
  // Mũi tên
  '\\to': '→', '\\rightarrow': '→', '\\leftarrow': '←',
  '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⟺',
  '\\leftrightarrow': '↔', '\\mapsto': '↦', '\\longrightarrow': '⟶',
  // Ký hiệu hình học / vector
  '\\angle': '∠', '\\triangle': '△', '\\perp': '⊥', '\\parallel': '∥',
  '\\overrightarrow': '', // Handled specially in parseVector
  // Ký hiệu khác
  '\\hbar': 'ℏ', '\\ell': 'ℓ', '\\Re': 'ℜ', '\\Im': 'ℑ',
  '\\aleph': 'ℵ', '\\wp': '℘', '\\circ': '∘', '\\bullet': '•',
  '\\star': '★', '\\dagger': '†', '\\ddagger': '‡',
  '\\land': '∧', '\\lor': '∨', '\\lnot': '¬', '\\neg': '¬',
  '\\oplus': '⊕', '\\otimes': '⊗',
  '\\because': '∵', '\\therefore': '∴',
  '\\quad': '\u2003', '\\qquad': '\u2003\u2003', '\\,': '\u2009',
  '\\!': '', '\\;': '\u2004', '\\ ': ' ',
  '\\left': '', '\\right': '', '\\big': '', '\\Big': '', '\\bigg': '', '\\Bigg': '',
  '\\rm': '', '\\bf': '', '\\it': '', '\\text': '',
};

/** Các cặp ngoặc */
const BRACKETS: Record<string, string> = {
  '(': '(', ')': ')',
  '[': '[', ']': ']',
  '{': '{', '}': '}',
  '\\{': '{', '\\}': '}',
  '\\langle': '⟨', '\\rangle': '⟩',
  '\\lfloor': '⌊', '\\rfloor': '⌋',
  '\\lceil': '⌈', '\\rceil': '⌉',
  '|': '|', '\\|': '‖',
};

/**
 * Lấy nhóm con tiếp theo từ vị trí pos trong chuỗi LaTeX.
 * Nhóm có thể là: {nội_dung} hoặc một ký tự đơn
 * Trả về [chuỗi_nội_dung, vị_trí_kế_tiếp]
 */
function getGroup(s: string, pos: number): [string, number] {
  // Bỏ qua khoảng trắng đầu
  while (pos < s.length && s[pos] === ' ') pos++;

  if (pos >= s.length) return ['', pos];

  if (s[pos] === '{') {
    let depth = 1;
    let i = pos + 1;
    while (i < s.length && depth > 0) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}') depth--;
      i++;
    }
    return [s.slice(pos + 1, i - 1), i];
  }

  // Lệnh LaTeX đơn \cmd
  if (s[pos] === '\\') {
    let i = pos + 1;
    if (i < s.length && /[a-zA-Z]/.test(s[i])) {
      while (i < s.length && /[a-zA-Z]/.test(s[i])) i++;
      return [s.slice(pos, i), i];
    }
    // \ký_tự_đặc_biệt
    return [s.slice(pos, pos + 2), pos + 2];
  }

  // Ký tự đơn
  return [s[pos], pos + 1];
}

/** Main: Phân tích LaTeX → OMML XML string */
export function latexToOmml(latex: string): string {
  const inner = parseExpr(latex.trim());
  return `<m:oMath xmlns:m="${NS_M}" xmlns:w="${NS_W}">${inner}</m:oMath>`;
}

/** Phân tích toàn bộ biểu thức LaTeX */
function parseExpr(s: string): string {
  const tokens = tokenize(s);
  return buildOmml(tokens);
}

/** Token type */
type Token =
  | { type: 'text'; value: string }
  | { type: 'frac'; num: string; den: string }
  | { type: 'sqrt'; deg: string; rad: string }
  | { type: 'sub'; base: string; sub: string }
  | { type: 'sup'; base: string; sup: string }
  | { type: 'subsup'; base: string; sub: string; sup: string }
  | { type: 'limits'; op: string; lower: string; upper: string }
  | { type: 'delim'; open: string; close: string; inner: string }
  | { type: 'matrix'; rows: string[][] }
  | { type: 'overline'; inner: string }
  | { type: 'underline'; inner: string }
  | { type: 'overset'; over: string; base: string }
  | { type: 'underset'; under: string; base: string }
  | { type: 'accent'; accent: string; base: string }
  | { type: 'bar'; base: string }
  | { type: 'hat'; base: string }
  | { type: 'vec'; base: string }
  | { type: 'tilde'; base: string }
  | { type: 'dot'; base: string }
  | { type: 'ddot'; base: string };

/** Tokenize LaTeX string thành mảng token cấu trúc */
function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < s.length) {
    // Bỏ qua khoảng trắng
    if (s[i] === ' ' || s[i] === '\t' || s[i] === '\n') { i++; continue; }

    // Phân số \frac{num}{den}
    if (s.startsWith('\\frac', i)) {
      i += 5;
      const [num, i2] = getGroup(s, i);
      const [den, i3] = getGroup(s, i2);
      tokens.push({ type: 'frac', num, den });
      i = i3;
      continue;
    }

    // Căn thức \sqrt[n]{x}
    if (s.startsWith('\\sqrt', i)) {
      i += 5;
      let deg = '';
      if (i < s.length && s[i] === '[') {
        const end = s.indexOf(']', i);
        deg = s.slice(i + 1, end);
        i = end + 1;
      }
      const [rad, i2] = getGroup(s, i);
      tokens.push({ type: 'sqrt', deg, rad });
      i = i2;
      continue;
    }

    // Tích phân, tổng, tích với giới hạn
    const limOps = ['\\int', '\\iint', '\\iiint', '\\oint', '\\sum', '\\prod', '\\lim', '\\max', '\\min', '\\sup', '\\inf'];
    let foundLimOp = false;
    for (const op of limOps) {
      if (s.startsWith(op, i)) {
        i += op.length;
        // Bỏ qua \limits hoặc \nolimits
        if (s.startsWith('\\limits', i)) i += 7;
        if (s.startsWith('\\nolimits', i)) i += 9;
        // Tìm _lower và ^upper
        let lower = '', upper = '';
        while (i < s.length && (s[i] === '_' || s[i] === '^' || s[i] === ' ')) {
          if (s[i] === ' ') { i++; continue; }
          if (s[i] === '_') { i++; [lower] = getGroup(s, i); const [, ni] = getGroup(s, i); i = ni; }
          else if (s[i] === '^') { i++; [upper] = getGroup(s, i); const [, ni] = getGroup(s, i); i = ni; }
        }
        tokens.push({ type: 'limits', op, lower, upper });
        foundLimOp = true;
        break;
      }
    }
    if (foundLimOp) continue;

    // \left ... \right
    if (s.startsWith('\\left', i)) {
      i += 5;
      while (i < s.length && s[i] === ' ') i++;
      let openChar = '';
      if (s[i] === '\\') {
        openChar = BRACKETS[s.slice(i, i + 2)] || s[i + 1];
        i += 2;
      } else {
        openChar = BRACKETS[s[i]] || s[i];
        i++;
      }
      // Tìm \right tương ứng
      let depth = 1;
      let j = i;
      while (j < s.length && depth > 0) {
        if (s.startsWith('\\left', j)) { depth++; j += 5; continue; }
        if (s.startsWith('\\right', j)) { depth--; if (depth === 0) break; j += 6; continue; }
        j++;
      }
      const innerContent = s.slice(i, j);
      j += 6; // skip \right
      while (j < s.length && s[j] === ' ') j++;
      let closeChar = '';
      if (s[j] === '\\') {
        closeChar = BRACKETS[s.slice(j, j + 2)] || s[j + 1];
        j += 2;
      } else {
        closeChar = BRACKETS[s[j]] || s[j];
        j++;
      }
      tokens.push({ type: 'delim', open: openChar, close: closeChar, inner: innerContent });
      i = j;
      continue;
    }

    // \overline{x}
    if (s.startsWith('\\overline', i)) {
      i += 9;
      const [inner, i2] = getGroup(s, i);
      tokens.push({ type: 'overline', inner });
      i = i2;
      continue;
    }

    // \underline{x}
    if (s.startsWith('\\underline', i)) {
      i += 10;
      const [inner, i2] = getGroup(s, i);
      tokens.push({ type: 'underline', inner });
      i = i2;
      continue;
    }

    // \overset{over}{base}
    if (s.startsWith('\\overset', i) || s.startsWith('\\stackrel', i)) {
      const cmdLen = s.startsWith('\\overset', i) ? 8 : 9;
      i += cmdLen;
      const [over, i2] = getGroup(s, i);
      const [base, i3] = getGroup(s, i2);
      tokens.push({ type: 'overset', over, base });
      i = i3;
      continue;
    }

    // \underset{under}{base}
    if (s.startsWith('\\underset', i)) {
      i += 9;
      const [under, i2] = getGroup(s, i);
      const [base, i3] = getGroup(s, i2);
      tokens.push({ type: 'underset', under, base });
      i = i3;
      continue;
    }

    // \hat, \bar, \vec, \tilde, \dot, \ddot, \widehat, \widetilde
    const accentMap: Record<string, string> = {
      '\\hat': '̂', '\\widehat': '̂',
      '\\bar': '̄', '\\overrightarrow': '⃗',
      '\\vec': '⃗',
      '\\tilde': '̃', '\\widetilde': '̃',
      '\\dot': '̇', '\\ddot': '̈',
    };
    let foundAccent = false;
    for (const [cmd, acc] of Object.entries(accentMap)) {
      if (s.startsWith(cmd, i)) {
        i += cmd.length;
        const [base, i2] = getGroup(s, i);
        tokens.push({ type: 'accent', accent: acc, base });
        i = i2;
        foundAccent = true;
        break;
      }
    }
    if (foundAccent) continue;

    // \begin{matrix/pmatrix/bmatrix/cases...}
    if (s.startsWith('\\begin{', i)) {
      const endBrace = s.indexOf('}', i + 7);
      const envName = s.slice(i + 7, endBrace);
      i = endBrace + 1;
      const endEnv = s.indexOf(`\\end{${envName}}`, i);
      const body = s.slice(i, endEnv);
      i = endEnv + `\\end{${envName}}`.length;
      const rows = body.split('\\\\').map(row =>
        row.split('&').map(cell => cell.trim())
      );
      tokens.push({ type: 'matrix', rows });
      continue;
    }

    // Ký hiệu đặc biệt \cmd
    if (s[i] === '\\') {
      // Kiểm tra lệnh dài trước
      let matched = '';
      for (const sym of Object.keys(SYMBOLS).sort((a, b) => b.length - a.length)) {
        if (s.startsWith(sym, i)) {
          matched = sym;
          break;
        }
      }
      if (matched) {
        const symChar = SYMBOLS[matched];
        if (symChar) tokens.push({ type: 'text', value: symChar });
        i += matched.length;
        continue;
      }
      // Lệnh không nhận dạng được → giữ nguyên text
      let j = i + 1;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      if (j > i + 1) {
        tokens.push({ type: 'text', value: s.slice(i + 1, j) });
        i = j;
        continue;
      }
      i += 2;
      continue;
    }

    // Gom kết quả trước là chữ/số để xử lý ^ và _
    // Xử lý x_n, x^2, x^{2n}, x_{ij}
    // Tìm base (ký tự đơn hoặc nhóm)
    let base = '';
    let baseEnd = i;
    if (s[i] === '{') {
      [base, baseEnd] = getGroup(s, i);
    } else if (s[i] === '(') {
      // Không phải base bình thường, xử lý như ký tự
      tokens.push({ type: 'text', value: '(' });
      i++;
      continue;
    } else {
      base = s[i];
      baseEnd = i + 1;
    }

    // Bỏ khoảng trắng
    let k = baseEnd;
    while (k < s.length && s[k] === ' ') k++;

    // Kiểm tra có ^ hoặc _ theo sau không
    if (k < s.length && (s[k] === '_' || s[k] === '^')) {
      let sub = '', sup = '';
      while (k < s.length && (s[k] === '_' || s[k] === '^' || s[k] === ' ')) {
        if (s[k] === ' ') { k++; continue; }
        if (s[k] === '_') {
          k++;
          [sub, k] = getGroup(s, k);
        } else if (s[k] === '^') {
          k++;
          [sup, k] = getGroup(s, k);
        }
      }
      if (sub && sup) tokens.push({ type: 'subsup', base, sub, sup });
      else if (sub) tokens.push({ type: 'sub', base, sub });
      else tokens.push({ type: 'sup', base, sup });
      i = k;
      continue;
    }

    // Ký tự thường (chữ, số, toán tử)
    tokens.push({ type: 'text', value: base });
    i = baseEnd;
  }

  return tokens;
}

/** Chuyển mảng token → chuỗi XML OMML */
function buildOmml(tokens: Token[]): string {
  return tokens.map(t => tokenToOmml(t)).join('');
}

function tokenToOmml(t: Token): string {
  switch (t.type) {
    case 'text':
      return mRun(t.value);

    case 'frac': {
      const num = el('num', parseExpr(t.num));
      const den = el('den', parseExpr(t.den));
      return el('f', num + den);
    }

    case 'sqrt': {
      if (t.deg) {
        const degEl = el('deg', parseExpr(t.deg));
        const radEl = el('e', parseExpr(t.rad));
        return el('rad', degEl + radEl);
      }
      const degHide = el('radPr', el('degHide', '', 'm:val="1"'));
      const radEl = el('e', parseExpr(t.rad));
      return el('rad', degHide + radEl);
    }

    case 'sub': {
      const eEl = el('e', parseExpr(t.base));
      const subEl = el('sub', parseExpr(t.sub));
      return el('sSub', eEl + subEl);
    }

    case 'sup': {
      const eEl = el('e', parseExpr(t.base));
      const supEl = el('sup', parseExpr(t.sup));
      return el('sSup', eEl + supEl);
    }

    case 'subsup': {
      const eEl = el('e', parseExpr(t.base));
      const subEl = el('sub', parseExpr(t.sub));
      const supEl = el('sup', parseExpr(t.sup));
      return el('sSubSup', eEl + subEl + supEl);
    }

    case 'limits': {
      const sym = SYMBOLS[t.op] || t.op.replace('\\', '');
      const ctrlPr = el('naryPr',
        el('limLoc', '', 'm:val="undOvr"') +
        el('subHide', '', `m:val="${t.lower ? '0' : '1'}"`) +
        el('supHide', '', `m:val="${t.upper ? '0' : '1'}"`)
      );
      const limLow = el('sub', t.lower ? parseExpr(t.lower) : '');
      const limUp = el('sup', t.upper ? parseExpr(t.upper) : '');
      const eEl = el('e', '');
      return el('nary', ctrlPr + el('r', el('t', esc(sym))) + limLow + limUp + eEl);
    }

    case 'delim': {
      const dPr = el('dPr',
        el('begChr', '', `m:val="${esc(t.open)}"`) +
        el('endChr', '', `m:val="${esc(t.close)}"`)
      );
      const eEl = el('e', parseExpr(t.inner));
      return el('d', dPr + eEl);
    }

    case 'matrix': {
      const rows = t.rows.map(row => {
        const cells = row.map(cell => el('e', parseExpr(cell)));
        return el('mr', cells.join(''));
      });
      return el('m', rows.join(''));
    }

    case 'overline': {
      const barPr = el('barPr', el('pos', '', 'm:val="top"'));
      const eEl = el('e', parseExpr(t.inner));
      return el('bar', barPr + eEl);
    }

    case 'underline': {
      const barPr = el('barPr', el('pos', '', 'm:val="bot"'));
      const eEl = el('e', parseExpr(t.inner));
      return el('bar', barPr + eEl);
    }

    case 'overset': {
      const limLoc = el('limUppPr', el('limLoc', '', 'm:val="ctr"'));
      const eEl = el('e', parseExpr(t.base));
      const limEl = el('lim', parseExpr(t.over));
      return el('limUpp', limLoc + eEl + limEl);
    }

    case 'underset': {
      const limLoc = el('limLowPr', el('limLoc', '', 'm:val="ctr"'));
      const eEl = el('e', parseExpr(t.base));
      const limEl = el('lim', parseExpr(t.under));
      return el('limLow', limLoc + eEl + limEl);
    }

    case 'accent': {
      const accPr = el('accPr', el('chr', '', `m:val="${esc(t.accent)}"`));
      const eEl = el('e', parseExpr(t.base));
      return el('acc', accPr + eEl);
    }

    default:
      return '';
  }
}
