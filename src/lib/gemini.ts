import type { GeminiPart, StyleId, SubjectId } from '../types';
import { STYLES } from '../data/styles';
import { SUBJECTS } from '../data/subjects';

export const MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'] as const;
export type ModelChoice = 'auto' | (typeof MODELS)[number];

const API = 'https://generativelanguage.googleapis.com/v1beta';

export function parseKeys(raw: string): string[] {
  return raw
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

export function buildSystemPrompt(style: StyleId, subject: SubjectId): string {
  const st = STYLES[style];
  const sj = SUBJECTS[subject];
  return `Bạn là hoạ sĩ kỹ thuật kiêm giáo viên phổ thông Việt Nam (Toán – Vật lý – Hoá học – Sinh học – Địa lý), chuyên vẽ hình minh hoạ chuẩn xác bằng SVG.

QUY TẮC VẼ SVG (bắt buộc):
1. Xuất đúng MỘT thẻ <svg> duy nhất, có xmlns="http://www.w3.org/2000/svg" và viewBox (mặc định "0 0 900 620", điều chỉnh theo nội dung).
2. Tuyệt đối không dùng <script>, <foreignObject>, <image>, không nhúng font hay tài nguyên ngoài.
3. Mọi chữ dùng <text> với font-family="Arial, Helvetica, sans-serif", font-size tối thiểu 15, chữ tiếng Việt đầy đủ dấu.
4. Hình phải đúng quan hệ toán học: vuông góc đúng 90°, song song đúng song song, trung điểm đúng giữa, tỉ lệ các cạnh phản ánh số liệu đề bài (có thể nén tỉ lệ nhưng giữ đúng thứ tự lớn – nhỏ).
5. Ký hiệu chuẩn: góc vuông vẽ ô vuông nhỏ ở đỉnh; góc thường vẽ cung tròn kèm số đo; cạnh bằng nhau đánh dấu gạch chéo; đường phụ và đường khuất dùng stroke-dasharray.
6. Ghi đầy đủ dữ kiện lên hình: độ dài kèm mũi tên hai đầu (định nghĩa <marker> trong <defs>), số đo góc, tên điểm. Nhãn đỉnh đặt lệch ra ngoài hình 12–18px, không đè lên nét vẽ hay chữ khác.
7. Chừa lề tối thiểu 40px quanh viewBox. Bố cục cân đối, không tràn khung.
8. Chữ có chỉ số dưới hoặc số mũ phải dùng <tspan> với dy và font-size nhỏ hơn, không viết H2SO4 phẳng.
9. Không viết lời giải bên trong hình, chỉ ghi dữ kiện và ký hiệu.
10. Nếu người dùng gửi ảnh phác thảo, giữ đúng bố cục và góc nhìn của bản phác thảo đó, chỉ vẽ lại cho chuẩn và đẹp.

QUY TẮC RIÊNG CỦA MÔN – ${sj.name}:
${sj.spec}

PHONG CÁCH MÀU SẮC – "${st.name}": ${st.spec}

ĐỊNH DẠNG TRẢ LỜI (bắt buộc, không thêm bất cứ lời dẫn nào):
<<<SVG>>>
(mã SVG thuần)
<<<TIKZ>>>
(mã TikZ tương ứng, bắt đầu bằng \\begin{tikzpicture} và kết thúc bằng \\end{tikzpicture})
<<<LOIGIAI>>>
(lời giải hoặc phần giải thích ngắn gọn bằng tiếng Việt, dạng Markdown; công thức toán, phương trình hoá học và biểu thức đặt trong $...$ hoặc $$...$$)
<<<HET>>>`;
}

export function buildUserPrompt(opts: {
  problem: string;
  wantTikz: boolean;
  wantSolution: boolean;
  extra?: string;
}): string {
  let t = 'ĐỀ BÀI:\n' + (opts.problem || '(xem ảnh đính kèm)');
  if (!opts.wantTikz) t += '\n\nBỏ qua phần TikZ: sau <<<TIKZ>>> chỉ ghi một dấu gạch ngang.';
  if (!opts.wantSolution) t += '\n\nBỏ qua phần lời giải: sau <<<LOIGIAI>>> chỉ ghi một dấu gạch ngang.';
  if (opts.extra) t += '\n\n' + opts.extra;
  return t;
}

export interface GenerateArgs {
  keys: string[];
  modelChoice: ModelChoice;
  system: string;
  parts: GeminiPart[];
  signal: AbortSignal;
  startModelIndex: number;
  startKeyIndex: number;
  onDelta: (fullText: string) => void;
  onStatus: (status: string) => void;
}

export interface GenerateResult {
  text: string;
  model: string;
  nextModelIndex: number;
  usedKeyIndex: number;
}

interface Candidate {
  content?: { parts?: { text?: string }[] };
  finishReason?: string;
}

/**
 * Gọi Gemini theo kiểu streaming, tự xoay vòng model và API key khi gặp lỗi
 * (hết hạn mức, quá tải, key sai…). Trả về toàn bộ văn bản khi thành công.
 */
export async function generate(args: GenerateArgs): Promise<GenerateResult> {
  const { keys, modelChoice, system, parts, signal, onDelta, onStatus } = args;
  const models: string[] =
    modelChoice === 'auto'
      ? MODELS.map((_, i) => MODELS[(args.startModelIndex + i) % MODELS.length])
      : [modelChoice];

  let lastError = 'Không rõ lỗi';

  for (const model of models) {
    for (let k = 0; k < keys.length; k++) {
      const keyIndex = (args.startKeyIndex + k) % keys.length;
      const key = keys[keyIndex];
      onStatus(`Đang gọi ${model} · key #${keyIndex + 1}…`);

      try {
        const base = {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts }],
        };
        const bodies: unknown[] = [
          { ...base, generationConfig: { temperature: 0.35, topP: 0.95, maxOutputTokens: 32768 } },
          base, // dự phòng khi máy chủ từ chối generationConfig
        ];

        let res: Response | null = null;
        let message = '';
        for (const body of bodies) {
          res = await fetch(
            `${API}/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`,
            {
              method: 'POST',
              signal,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            },
          );
          if (res.ok) break;
          message = String(res.status);
          try {
            const j = (await res.json()) as { error?: { message?: string } };
            message = j.error?.message || message;
          } catch {
            /* giữ nguyên mã lỗi */
          }
          if (res.status !== 400) break;
        }

        if (!res || !res.ok) {
          lastError = `${model}: ${message}`;
          continue;
        }

        const text = await readStream(res, onDelta, onStatus);
        if (!text.trim()) {
          lastError = `${model}: phản hồi rỗng`;
          continue;
        }
        return {
          text,
          model,
          nextModelIndex: (MODELS.indexOf(model as (typeof MODELS)[number]) + 1) % MODELS.length,
          usedKeyIndex: keyIndex,
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') throw err;
        lastError = `${model}: ${(err as Error).message}`;
      }
    }
  }
  throw new Error(lastError);
}

async function readStream(
  res: Response,
  onDelta: (full: string) => void,
  onStatus: (s: string) => void,
): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload) as { candidates?: Candidate[] };
        for (const c of json.candidates ?? []) {
          for (const p of c.content?.parts ?? []) {
            if (typeof p.text === 'string') {
              full += p.text;
              onDelta(full);
            }
          }
          if (c.finishReason && c.finishReason !== 'STOP' && c.finishReason !== 'FINISH_REASON_UNSPECIFIED') {
            onStatus(`Phản hồi kết thúc sớm (${c.finishReason}). Hình có thể thiếu nét — hãy bấm Sửa lại hình.`);
          }
        }
      } catch {
        /* mảnh JSON chưa đủ, bỏ qua */
      }
    }
  }
  return full;
}

/** Kiểm tra nhanh từng key bằng endpoint liệt kê model. */
export async function testKeys(keys: string[]): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    try {
      const r = await fetch(`${API}/models?key=${encodeURIComponent(keys[i])}`);
      out.push(`Key ${i + 1}: ${r.ok ? 'hoạt động' : 'lỗi ' + r.status}`);
    } catch {
      out.push(`Key ${i + 1}: không kết nối được`);
    }
  }
  return out;
}
