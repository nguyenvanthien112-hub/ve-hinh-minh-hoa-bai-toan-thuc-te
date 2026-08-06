import type { SubjectId } from '../types';

export interface LibGroup {
  subject: SubjectId;
  cat: string;
  items: string[];
}

export const LIBRARY: LibGroup[] = [
  {
    subject: 'math',
    cat: 'Toán thực tế – tỉ số lượng giác',
    items: [
      'Một tòa nhà cao 45 m. Tại một thời điểm, bóng của tòa nhà trên mặt đất dài 30 m. Tính góc tạo bởi tia nắng mặt trời và mặt đất.',
      'Từ đỉnh ngọn hải đăng cao 80 m so với mực nước biển, người ta nhìn thấy một chiếc thuyền dưới góc hạ 24°. Tính khoảng cách từ chân hải đăng đến thuyền.',
      'Để đo chiều rộng một con sông, người ta chọn điểm A bên này bờ, điểm B bên kia bờ. Từ A đi dọc bờ 60 m đến C, đo được góc ACB = 52°. Tính chiều rộng con sông.',
      'Một cây cao 6 m nghiêng so với phương thẳng đứng một góc 15°. Tính chiều dài bóng của cây khi tia nắng chiếu vuông góc với mặt đất.',
    ],
  },
  {
    subject: 'math',
    cat: 'Hình học phẳng',
    items: [
      'Cho tam giác ABC vuông tại A, AB = 6 cm, AC = 8 cm. Kẻ đường cao AH. Tính AH, BH, CH.',
      'Cho đường tròn (O; R) và điểm A nằm ngoài đường tròn với OA = 2R. Kẻ hai tiếp tuyến AB, AC. Chứng minh tam giác ABC đều.',
      'Cho hình thang cân ABCD (AB // CD), AB = 4 cm, CD = 10 cm, đường cao 4 cm. Tính độ dài cạnh bên và đường chéo.',
      'Cho tam giác ABC nội tiếp đường tròn (O), các đường cao AD, BE, CF cắt nhau tại H. Vẽ hình và chỉ ra các tứ giác nội tiếp.',
    ],
  },
  {
    subject: 'math',
    cat: 'Hình học không gian',
    items: [
      'Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy và SA = a√2. Vẽ hình và xác định góc giữa SC và mặt đáy.',
      "Cho lăng trụ đứng tam giác ABC.A'B'C' có đáy là tam giác đều cạnh a, chiều cao 2a. Vẽ hình và tính thể tích.",
      'Cho hình nón có bán kính đáy 3 cm, chiều cao 4 cm. Vẽ hình nón kèm đường sinh, tính diện tích xung quanh.',
      "Cho hình hộp chữ nhật ABCD.A'B'C'D' có AB = 3, AD = 4, AA' = 12. Vẽ hình và tính độ dài đường chéo AC'.",
    ],
  },
  {
    subject: 'math',
    cat: 'Tiểu học – sơ đồ đoạn thẳng',
    items: [
      'Tổng hai số là 120, số lớn hơn số bé 24 đơn vị. Vẽ sơ đồ đoạn thẳng và tìm hai số.',
      'Một mảnh vườn hình chữ nhật có chu vi 96 m, chiều dài gấp 3 lần chiều rộng. Vẽ sơ đồ và tính diện tích.',
      'Lớp 4A có 35 học sinh, số học sinh nữ bằng 3/4 số học sinh nam. Vẽ sơ đồ đoạn thẳng minh hoạ.',
      'Hai vòi nước cùng chảy vào một bể. Vòi thứ nhất chảy đầy bể trong 4 giờ, vòi thứ hai trong 6 giờ. Vẽ sơ đồ minh hoạ phần bể mỗi vòi chảy trong 1 giờ.',
    ],
  },
  {
    subject: 'math',
    cat: 'Đồ thị – thống kê',
    items: [
      'Vẽ đồ thị hàm số y = x² và đường thẳng y = 2x + 3 trên cùng hệ trục, đánh dấu giao điểm.',
      'Vẽ biểu đồ cột thể hiện điểm kiểm tra của lớp: điểm 5 có 4 bạn, điểm 6 có 8 bạn, điểm 7 có 12 bạn, điểm 8 có 9 bạn, điểm 9 có 5 bạn, điểm 10 có 2 bạn.',
      'Biểu diễn trên trục số tập nghiệm của bất phương trình −2 ≤ x < 5.',
      'Vẽ đường tròn lượng giác, đánh dấu các góc đặc biệt 0°, 30°, 45°, 60°, 90° và giá trị sin, cos tương ứng.',
    ],
  },
  {
    subject: 'physics',
    cat: 'Vật lý – cơ học',
    items: [
      'Một vật khối lượng 5 kg nằm trên mặt phẳng nghiêng góc 30° so với phương ngang. Vẽ hình biểu diễn các lực tác dụng lên vật.',
      'Một vật được ném xiên với vận tốc ban đầu 20 m/s, góc ném 45°. Vẽ quỹ đạo chuyển động và các vectơ vận tốc.',
      'Hệ ròng rọc động và ròng rọc cố định dùng để nâng vật nặng 100 N. Vẽ sơ đồ hệ ròng rọc và biểu diễn lực kéo.',
      'Một thanh AB dài 2 m, đồng chất, tựa trên điểm O cách A 0,5 m. Treo vật 40 N tại A. Vẽ hình đòn bẩy và tính lực tại B.',
    ],
  },
  {
    subject: 'physics',
    cat: 'Vật lý – điện, quang',
    items: [
      'Mạch điện gồm nguồn 12 V, hai điện trở R1 = 4 Ω và R2 = 6 Ω mắc nối tiếp, có ampe kế và vôn kế. Vẽ sơ đồ mạch điện.',
      'Vẽ sơ đồ mạch điện có hai bóng đèn mắc song song, một khoá K điều khiển toàn mạch và một khoá riêng cho đèn 2.',
      'Một vật sáng AB đặt vuông góc trục chính của thấu kính hội tụ tiêu cự 12 cm, cách thấu kính 18 cm. Vẽ ảnh và nêu tính chất của ảnh.',
      'Tia sáng truyền từ nước sang không khí với góc tới 30°. Vẽ hình mô tả hiện tượng khúc xạ ánh sáng.',
    ],
  },
  {
    subject: 'chemistry',
    cat: 'Hoá học – dụng cụ và thí nghiệm',
    items: [
      'Vẽ sơ đồ bộ dụng cụ điều chế khí oxi trong phòng thí nghiệm bằng cách nhiệt phân KMnO4 và thu khí bằng phương pháp đẩy nước.',
      'Vẽ sơ đồ thí nghiệm điều chế khí hiđro từ kẽm và dung dịch HCl bằng bình Kipp đơn giản, thu khí bằng cách đẩy không khí úp ngược ống nghiệm.',
      'Vẽ bộ dụng cụ chuẩn độ dung dịch NaOH bằng dung dịch HCl: buret, bình tam giác, phễu, chỉ thị phenolphtalein.',
      'Vẽ sơ đồ thí nghiệm chưng cất đơn giản để tách nước ra khỏi dung dịch muối ăn: bình cầu, nhiệt kế, ống sinh hàn, bình hứng.',
      'Vẽ thí nghiệm dẫn khí CO2 vào dung dịch nước vôi trong Ca(OH)2 và nêu hiện tượng quan sát được.',
      'Vẽ sơ đồ thí nghiệm điều chế và thử tính tan của khí amoniac NH3 bằng thí nghiệm phun nước có phenolphtalein.',
    ],
  },
  {
    subject: 'chemistry',
    cat: 'Hoá học – cấu tạo chất',
    items: [
      'Vẽ mô hình cấu tạo nguyên tử natri (Z = 11): hạt nhân và sự phân bố electron trên các lớp.',
      'Vẽ công thức cấu tạo của phân tử etanol C2H5OH và axit axetic CH3COOH, chỉ rõ nhóm chức.',
      'Vẽ công thức cấu tạo của benzen C6H6 theo hai cách biểu diễn thường gặp.',
      'Vẽ sơ đồ hình thành liên kết ion trong phân tử NaCl bằng mũi tên chuyển electron.',
      'Vẽ ô nguyên tố của nguyên tố oxi trong bảng tuần hoàn và giải thích các thông tin trong ô.',
      'Vẽ công thức cấu tạo mạch hở của các đồng phân ứng với công thức phân tử C4H10.',
    ],
  },
  {
    subject: 'chemistry',
    cat: 'Hoá học – phản ứng và điện hoá',
    items: [
      'Vẽ sơ đồ điện phân dung dịch CuSO4 với điện cực trơ: chỉ rõ anot, catot, chiều dòng electron và sản phẩm ở mỗi điện cực.',
      'Vẽ sơ đồ pin điện hoá Zn–Cu (pin Daniell) có cầu muối, ghi chiều di chuyển của electron và ion.',
      'Vẽ sơ đồ tư duy các phản ứng chuyển hoá: Fe → FeCl2 → Fe(OH)2 → FeO → Fe, kèm điều kiện phản ứng trên mũi tên.',
      'Vẽ đồ thị biểu diễn khối lượng kết tủa theo số mol NaOH khi cho từ từ NaOH vào dung dịch AlCl3.',
      'Vẽ sơ đồ thí nghiệm ăn mòn điện hoá của sắt khi tiếp xúc với đồng trong dung dịch chất điện li.',
    ],
  },
  {
    subject: 'biology',
    cat: 'Sinh học – tế bào và di truyền',
    items: [
      'Vẽ và chú thích cấu tạo tế bào thực vật, so sánh với tế bào động vật.',
      'Vẽ sơ đồ cấu trúc một đoạn phân tử ADN xoắn kép, chỉ rõ nguyên tắc bổ sung giữa các bazơ nitơ.',
      'Vẽ sơ đồ lai một cặp tính trạng ở đậu Hà Lan từ P đến F2, kèm bảng Punnett.',
      'Vẽ sơ đồ các kỳ của quá trình nguyên phân ở tế bào có 2n = 4.',
    ],
  },
  {
    subject: 'biology',
    cat: 'Sinh học – cơ thể và sinh thái',
    items: [
      'Vẽ sơ đồ vòng tuần hoàn máu ở người, phân biệt vòng tuần hoàn lớn và nhỏ bằng màu sắc.',
      'Vẽ sơ đồ quá trình quang hợp ở lá cây: chất tham gia, sản phẩm và điều kiện.',
      'Vẽ một lưới thức ăn trong hệ sinh thái đồng cỏ gồm cỏ, châu chấu, ếch, rắn, đại bàng, vi sinh vật.',
      'Vẽ và chú thích cấu tạo của hệ tiêu hoá ở người.',
    ],
  },
  {
    subject: 'geography',
    cat: 'Địa lý',
    items: [
      'Vẽ sơ đồ chuyển động của Trái Đất quanh Mặt Trời, thể hiện trục nghiêng 23,5° và bốn vị trí ứng với các mùa.',
      'Vẽ sơ đồ vòng tuần hoàn của nước trên Trái Đất kèm tên các quá trình.',
      'Vẽ biểu đồ khí hậu của Hà Nội: cột lượng mưa và đường nhiệt độ theo 12 tháng.',
      'Vẽ lát cắt địa hình từ tây sang đông của lãnh thổ Việt Nam theo vĩ tuyến 16°B.',
    ],
  },
];

export interface QuickPick {
  label: string;
  problem: string;
  subject: SubjectId;
}

const pick = (cat: string, index: number): LibGroup => LIBRARY.filter((g) => g.cat === cat)[index] ?? LIBRARY[0];

export const QUICK_PICKS: QuickPick[] = [
  { label: 'Chiều cao tòa nhà', subject: 'math', problem: pick('Toán thực tế – tỉ số lượng giác', 0).items[0] },
  { label: 'Hình chóp S.ABCD', subject: 'math', problem: pick('Hình học không gian', 0).items[0] },
  { label: 'Sơ đồ đoạn thẳng', subject: 'math', problem: pick('Tiểu học – sơ đồ đoạn thẳng', 0).items[0] },
  { label: 'Mặt phẳng nghiêng', subject: 'physics', problem: pick('Vật lý – cơ học', 0).items[0] },
  { label: 'Mạch điện nối tiếp', subject: 'physics', problem: pick('Vật lý – điện, quang', 0).items[0] },
  { label: 'Điều chế khí oxi', subject: 'chemistry', problem: pick('Hoá học – dụng cụ và thí nghiệm', 0).items[0] },
  { label: 'Chuẩn độ axit – bazơ', subject: 'chemistry', problem: pick('Hoá học – dụng cụ và thí nghiệm', 0).items[2] },
  { label: 'Cấu tạo nguyên tử Na', subject: 'chemistry', problem: pick('Hoá học – cấu tạo chất', 0).items[0] },
  { label: 'Điện phân CuSO₄', subject: 'chemistry', problem: pick('Hoá học – phản ứng và điện hoá', 0).items[0] },
  { label: 'Cấu tạo tế bào', subject: 'biology', problem: pick('Sinh học – tế bào và di truyền', 0).items[0] },
  { label: 'Sơ đồ lai F2', subject: 'biology', problem: pick('Sinh học – tế bào và di truyền', 0).items[2] },
  { label: 'Trái Đất quanh Mặt Trời', subject: 'geography', problem: pick('Địa lý', 0).items[0] },
];

export const LIBRARY_COUNT = LIBRARY.reduce((n, g) => n + g.items.length, 0);
