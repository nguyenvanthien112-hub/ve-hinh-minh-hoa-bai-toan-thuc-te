import type { SubjectDef, SubjectId } from '../types';

/**
 * Mỗi môn có một bộ quy tắc vẽ riêng được chèn vào system prompt,
 * nhờ vậy AI biết dùng đúng ký hiệu chuyên ngành thay vì vẽ chung chung.
 */
export const SUBJECTS: Record<SubjectId, SubjectDef> = {
  auto: {
    name: 'Tự nhận diện',
    short: 'Tự động',
    icon: 'fas fa-wand-magic',
    spec:
      'Tự xác định đề bài thuộc môn nào (Toán, Vật lý, Hoá học, Sinh học, Địa lý) rồi áp dụng đúng chuẩn ký hiệu ' +
      'và cách trình bày hình vẽ của môn đó theo sách giáo khoa Việt Nam.',
  },

  math: {
    name: 'Toán học',
    short: 'Toán',
    icon: 'fas fa-square-root-variable',
    spec: `MÔN TOÁN:
- Hình phẳng: ghi tên đỉnh bằng chữ in hoa đặt lệch ra ngoài; đánh dấu góc vuông bằng ô vuông nhỏ, góc thường bằng cung tròn kèm số đo, cạnh bằng nhau bằng gạch chéo, cạnh song song bằng mũi tên cùng chiều.
- Hình không gian: vẽ theo phép chiếu song song, cạnh khuất dùng stroke-dasharray="6 5", mặt đáy vẽ hình bình hành, tô mặt bằng fill-opacity thấp để thấy cạnh khuất.
- Đường tròn: đánh dấu tâm bằng dấu chấm và chữ O, bán kính vẽ nét mảnh kèm nhãn R.
- Sơ đồ đoạn thẳng tiểu học: các đoạn xếp song song thẳng hàng trái, cùng đơn vị chiều dài, dùng dấu ngoặc nhọn ghi tổng và hiệu.
- Đồ thị hàm số: trục Ox, Oy có mũi tên và nhãn, chia vạch đều kèm số, lưới mờ, đánh dấu giao điểm bằng chấm tròn và ghi toạ độ.
- Biểu đồ thống kê: cột hoặc quạt có ghi số liệu và chú giải.`,
  },

  physics: {
    name: 'Vật lý',
    short: 'Lý',
    icon: 'fas fa-atom',
    spec: `MÔN VẬT LÝ:
- Cơ học: vectơ lực vẽ bằng mũi tên (định nghĩa marker trong defs), độ dài tỉ lệ với độ lớn, ghi tên lực (P, N, Fms, F, T) ngay đầu mũi tên; mặt phẳng nghiêng có gạch chéo phần đất; ròng rọc vẽ hình tròn có trục và dây vắt qua.
- Chuyển động: quỹ đạo vẽ nét liền, vị trí các mốc thời gian đánh dấu chấm, vectơ vận tốc tiếp tuyến quỹ đạo.
- Điện học: dùng ký hiệu chuẩn SGK — nguồn (vạch dài, vạch ngắn), điện trở (hình chữ nhật rỗng), bóng đèn (vòng tròn có dấu nhân), khoá K, ampe kế (A) mắc nối tiếp, vôn kế (V) mắc song song; dây dẫn chỉ vẽ đoạn ngang và dọc, nút giao có chấm tròn đặc.
- Quang học: thấu kính vẽ đoạn thẳng có hai mũi tên đầu (hội tụ) hoặc mũi tên hướng vào (phân kỳ), trục chính nét đứt, tiêu điểm F và F' đánh dấu, tia sáng có mũi tên chỉ chiều, ảnh ảo vẽ nét đứt.
- Nhiệt học và sóng: đồ thị có trục ghi đại lượng kèm đơn vị.`,
  },

  chemistry: {
    name: 'Hoá học',
    short: 'Hoá',
    icon: 'fas fa-flask',
    spec: `MÔN HOÁ HỌC:
- CHỈ SỐ VÀ SỐ MŨ trong công thức hoá học là bắt buộc: viết bằng tspan, ví dụ H<tspan dy="5" font-size="11">2</tspan><tspan dy="-5">SO</tspan><tspan dy="5" font-size="11">4</tspan>. Điện tích viết dạng số mũ với dy âm, ví dụ SO<tspan dy="5" font-size="11">4</tspan><tspan dy="-10" font-size="11">2−</tspan>.
- Dụng cụ thí nghiệm vẽ dạng cắt 2D nét viền dày 2.5: ống nghiệm (đáy tròn), bình cầu đáy tròn hoặc đáy bằng, bình tam giác Erlenmeyer, cốc thuỷ tinh có vạch chia, phễu chiết, buret có vạch và khoá, ống dẫn khí, nút cao su, giá sắt kẹp ống nghiệm, đèn cồn có ngọn lửa vàng cam, chậu thuỷ tinh để thu khí qua nước.
- Chất lỏng tô màu nhạt fill-opacity 0.35 với mặt thoáng là đường ngang; dung dịch có màu đặc trưng (CuSO4 xanh lam, KMnO4 tím, Br2 nâu đỏ, phenolphtalein hồng). Kết tủa vẽ chấm nhỏ rải ở đáy, bọt khí vẽ vòng tròn nhỏ nổi lên, mũi tên chỉ chiều khí thoát.
- Nhãn hoá chất đặt cạnh đúng dụng cụ chứa nó, kèm mũi tên chỉ dẫn mảnh khi cần. Ghi phương trình phản ứng bên dưới hình nếu đề yêu cầu, mũi tên phản ứng là → hoặc ⇌.
- Công thức cấu tạo hữu cơ: góc liên kết 120° cho mạch hở dạng zic-zac, liên kết đôi vẽ hai nét song song cách 4px, liên kết ba vẽ ba nét; vòng benzen vẽ lục giác đều kèm vòng tròn bên trong; nhóm chức (−OH, −COOH, −NH2, −CHO) ghi rõ.
- Mô hình nguyên tử: hạt nhân là vòng tròn ghi số proton và neutron, các lớp electron là cung tròn đồng tâm nét mảnh, electron là chấm tròn đặc, ghi số electron mỗi lớp.
- Ô nguyên tố bảng tuần hoàn: khung vuông chứa số hiệu nguyên tử ở trên, ký hiệu chữ lớn ở giữa, tên và nguyên tử khối ở dưới.
- Sơ đồ điện phân và pin điện hoá: ghi rõ anot (+) và catot (−), chiều dòng electron, chiều di chuyển ion, cầu muối vẽ hình chữ U ngược.
- Sơ đồ điều chế và thu khí: thể hiện đúng cách thu (đẩy nước, đẩy không khí úp bình hay ngửa bình) tuỳ tỉ khối của khí.`,
  },

  biology: {
    name: 'Sinh học',
    short: 'Sinh',
    icon: 'fas fa-dna',
    spec: `MÔN SINH HỌC:
- Tế bào: vẽ mặt cắt, chú thích từng bào quan bằng đường dẫn mảnh ra lề (màng sinh chất, nhân, ti thể, lục lạp, không bào, ribosome); mỗi bào quan một màu nhạt riêng.
- Di truyền: sơ đồ lai ghi P, G, F1, F2 theo hàng; bảng Punnett vẽ lưới ô vuông có kiểu gen trong ô; phép lai ghi kiểu gen và kiểu hình đầy đủ.
- ADN và nhiễm sắc thể: chuỗi xoắn kép có bậc thang liên kết A–T, G–X ghi rõ; nhiễm sắc thể vẽ hình chữ X có tâm động.
- Cơ thể người và động vật: sơ đồ hệ cơ quan có mũi tên chỉ chiều di chuyển của máu, khí hoặc thức ăn; máu giàu oxi màu đỏ, nghèo oxi màu xanh.
- Sinh thái: chuỗi và lưới thức ăn dùng mũi tên chỉ chiều truyền năng lượng; tháp sinh thái vẽ các bậc hình thang xếp chồng.
- Quá trình sinh học tuần hoàn (quang hợp, hô hấp, nguyên phân, giảm phân) vẽ theo vòng hoặc theo dãy giai đoạn có đánh số thứ tự.`,
  },

  geography: {
    name: 'Địa lý',
    short: 'Địa',
    icon: 'fas fa-earth-asia',
    spec: `MÔN ĐỊA LÝ:
- Bản đồ và lược đồ: vẽ đường bờ biển và ranh giới đơn giản hoá, biển tô xanh nhạt, đất liền tô be hoặc xanh lá nhạt; luôn có mũi tên chỉ hướng bắc, thước tỉ lệ và bảng chú giải ở góc.
- Lát cắt địa hình: trục ngang là khoảng cách, trục dọc là độ cao kèm đơn vị mét, các tầng địa hình tô màu phân tầng.
- Biểu đồ khí hậu: cột lượng mưa kết hợp đường nhiệt độ, hai trục dọc riêng có nhãn và đơn vị, trục ngang là 12 tháng.
- Chuyển động Trái Đất: vẽ Mặt Trời, Trái Đất nghiêng 23,5°, trục nghiêng nét đứt, mũi tên chiều tự quay và chiều quay quanh Mặt Trời, đánh dấu xích đạo, chí tuyến và vòng cực.
- Sơ đồ vòng tuần hoàn nước, hoàn lưu khí quyển, dòng biển: dùng mũi tên cong ghi tên quá trình.`,
  },
};

export const SUBJECT_IDS = Object.keys(SUBJECTS) as SubjectId[];
