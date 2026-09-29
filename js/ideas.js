// ACTIVITIES — chỉ là hoạt động, không gắn địa điểm cụ thể.
// Địa điểm nằm ở PLACES + AI (Gemini) + Google Maps search.
// who: mot-minh | ban-be | nguoi-yeu | gia-dinh
// budget: free | re | trungbinh | cao
// vibe: chill | van-dong | an-uong | kham-pha | van-hoa
// time: sang | chieu | toi | cuoi-tuan

const ACTIVITIES = [
  { id:"chay-bo", title:"Chạy bộ", desc:"Ra hồ / công viên làm vài vòng, xong ăn sáng vỉa hè. Môn quốc dân, tốn 0đ.", who:["mot-minh","ban-be"], budget:"free", vibe:"van-dong", time:["sang","chieu"], cost:"0đ (+gửi xe 5-10k)", priceHint:"Gửi xe 5-10k, nước 10-15k, ăn sáng 35-50k", query:"đường chạy bộ công viên Hà Nội", hot:true },
  { id:"dap-xe", title:"Đạp xe", desc:"Thuê xe đạp đôi / đơn, dạo hồ chiều mát, dừng ăn vặt.", who:["mot-minh","ban-be","nguoi-yeu"], budget:"re", vibe:"van-dong", time:["chieu","sang"], cost:"40-100k", priceHint:"Thuê xe 40-80k/buổi, ăn vặt 30-60k", query:"thuê xe đạp Hồ Tây Hà Nội", hot:true },
  { id:"picnic", title:"Picnic công viên", desc:"Mua đồ ăn sẵn, mang chiếu / bạt, nằm dài trên cỏ đọc sách, ngủ trưa.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"re", vibe:"chill", time:["sang","chieu","cuoi-tuan"], cost:"50-100k/người", priceHint:"Đồ ăn tự chuẩn bị 50-100k, thuê chiếu 20-30k", query:"công viên picnic Hà Nội", hot:true },
  { id:"cafe-ngoi", title:"Cà phê ngồi chill", desc:"Chọn 1 quán ruột, gọi món tủ, ngồi đọc sách / tâm sự 2-3 tiếng.", who:["mot-minh","ban-be","nguoi-yeu"], budget:"re", vibe:"chill", time:["sang","chieu","toi"], cost:"25-60k", priceHint:"Đồ uống 25-60k", query:"quán cà phê đẹp Hà Nội", hot:true },
  { id:"cafe-song-ao", title:"Tour cà phê sống ảo", desc:"Lên list 2-3 quán decor đẹp, mỗi quán 30-45 phút chụp ảnh.", who:["ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"van-hoa", time:["sang","chieu"], cost:"100-200k", priceHint:"Mỗi quán 40-70k", query:"quán cafe sống ảo Tây Hồ Hà Nội", hot:true },
  { id:"tra-chanh", title:"Trà chanh vỉa hè", desc:"Combo trà chanh + hướng dương, ngồi bệt tám đến khuya. Rẻ nhất mà vui nhất.", who:["ban-be","nguoi-yeu"], budget:"free", vibe:"chill", time:["toi"], cost:"20-40k", priceHint:"Trà chanh 10-15k, hướng dương 15k", query:"trà chanh Nhà Thờ Lớn Hà Nội", hot:false },
  { id:"foodtour", title:"Foodtour chợ đêm / phố ăn vặt", desc:"Cầm 200k, món nào đông người xếp hàng thì quất món đó.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"trungbinh", vibe:"an-uong", time:["toi"], cost:"150-250k", priceHint:"Mỗi món 20-60k, tổng 150-250k là no", query:"chợ đêm Đồng Xuân ăn vặt Hà Nội", hot:true },
  { id:"tour-oc", title:"Tour ốc Hà Nội", desc:"Ốc luộc, ốc xào, nem chua rán. Trời lạnh ăn ốc nóng là hết sảy.", who:["ban-be","nguoi-yeu"], budget:"re", vibe:"an-uong", time:["chieu","toi"], cost:"60-120k/người", priceHint:"Ốc 40-70k/bát, nem 30k", query:"quán ốc ngon Hà Nội", hot:false },
  { id:"buffet", title:"Buffet nướng / lẩu", desc:"Nướng Hàn, lẩu Thái, buffet chay. Đi team 4+ gọi combo rẻ hơn.", who:["ban-be","gia-dinh"], budget:"trungbinh", vibe:"an-uong", time:["toi"], cost:"150-300k/người", priceHint:"Buffet 150-300k, nước 20-30k", query:"buffet nướng lẩu Hà Nội", hot:false },
  { id:"sushi", title:"Sushi / omakase bản lite", desc:"Sushi băng chuyền 30-50k/đĩa, omakase set 300-600k. Thử fine-dining giá mềm.", who:["nguoi-yeu","ban-be"], budget:"cao", vibe:"an-uong", time:["toi"], cost:"200-500k/người", priceHint:"Băng chuyền 150-250k, omakase 300-600k/set", query:"sushi băng chuyền Hà Nội", hot:false },
  { id:"phim-rap", title:"Xem phim rạp", desc:"Săn phim hot, đi suất chiếu muộn cho vắng. Bắp lớn + hàng giữa là chân ái.", who:["mot-minh","ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"chill", time:["toi"], cost:"120-230k", priceHint:"Vé 2D 90-120k, IMAX/4DX 150-250k, bắp+nước 70-100k", query:"rạp chiếu phim CGV Lotte Hà Nội", hot:true },
  { id:"phim-ngoai-troi", title:"Xem phim ngoài trời", desc:"Chiếu ngoài trời, mang bạt ngồi, chill hết nấc. Check event trước khi đi.", who:["ban-be","nguoi-yeu"], budget:"re", vibe:"van-hoa", time:["toi","cuoi-tuan"], cost:"50-120k", priceHint:"Vé 50-100k, đồ ăn mang theo 50k", query:"chiếu phim ngoài trời Hà Nội", hot:true },
  { id:"bao-tang", title:"Bảo tàng / triển lãm", desc:"Bảo tàng Dân tộc học, Hỏa Lò, Hoàng thành, VCCA... nhiều chỗ free.", who:["mot-minh","ban-be","nguoi-yeu","gia-dinh"], budget:"free", vibe:"van-hoa", time:["sang","chieu","cuoi-tuan"], cost:"0-100k", priceHint:"Vé 30-70k, nhiều triển lãm free", query:"bảo tàng triển lãm Hà Nội", hot:false },
  { id:"show-live", title:"Múa rối nước / kịch / show live", desc:"Đặc sản văn hóa HN. Mặc đẹp đi xem một lần cho biết.", who:["gia-dinh","ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"van-hoa", time:["chieu","toi"], cost:"100-500k", priceHint:"Múa rối 100-200k, kịch 200-500k", query:"nhà hát múa rối nước Thăng Long Hà Nội", hot:false },
  { id:"karaoke", title:"Karaoke", desc:"Gom 4-5 đứa, thuê phòng 2 tiếng, hát từ ballad tới rap.", who:["ban-be","gia-dinh"], budget:"trungbinh", vibe:"chill", time:["toi"], cost:"100-200k/người", priceHint:"Phòng 200-400k/h chia team", query:"quán karaoke Hà Nội", hot:false },
  { id:"boardgame", title:"Cà phê boardgame", desc:"Ma sói, Uno, Exploding Kittens. Chơi đến khuya.", who:["ban-be"], budget:"re", vibe:"chill", time:["toi"], cost:"30-70k/người", priceHint:"Phí chơi + nước 30-70k/người", query:"cafe boardgame Hà Nội", hot:false },
  { id:"bia", title:"Bi-a", desc:"Bàn libre / pool 30-60k/h, quán mở đến 2h sáng.", who:["ban-be"], budget:"re", vibe:"chill", time:["chieu","toi"], cost:"50-120k", priceHint:"Thuê bàn 30-60k/h chia 2-4", query:"bida club Hà Nội", hot:false },
  { id:"bowling", title:"Bowling / game center", desc:"Bowling + arcade + VR trong mall. Thua bao nước.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"trungbinh", vibe:"chill", time:["chieu","toi","cuoi-tuan"], cost:"100-250k", priceHint:"Bowling 80-150k/game, xu game 100-200k", query:"bowling Aeon Royal City Hà Nội", hot:false },
  { id:"boi", title:"Đi bơi", desc:"Bơi 1 tiếng là deadline trôi hết. Nhớ mang kính bơi + đồ khô thay.", who:["mot-minh","ban-be"], budget:"re", vibe:"van-dong", time:["sang","chieu"], cost:"40-150k", priceHint:"Bể công 40-70k, bể tư 80-150k", query:"bể bơi bốn mùa Hà Nội", hot:false },
  { id:"cau-long", title:"Cầu lông", desc:"Môn quốc dân, sân rẻ, dễ rủ. Đánh xong làm cốc nước mía.", who:["ban-be"], budget:"re", vibe:"van-dong", time:["chieu","toi"], cost:"30-60k/người", priceHint:"Thuê sân 80-150k/h chia nhóm", query:"sân cầu lông Hà Nội", hot:false },
  { id:"pickleball", title:"Pickleball", desc:"Môn hot nhất HN. Thuê vợt + học 1 buổi là chơi được. Rủ 4 người chia tiền sân siêu rẻ.", who:["ban-be","nguoi-yeu","mot-minh"], budget:"re", vibe:"van-dong", time:["sang","chieu","toi"], cost:"50-100k/người", priceHint:"Sân 150-250k/h, thuê vợt 30-50k", query:"sân pickleball Hà Nội", hot:true },
  { id:"padel", title:"Padel / tennis", desc:"Trend mới sau pickleball, sân kính, dễ chơi hơn tennis. Có buổi trial cho newbie.", who:["ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"150-250k/người", priceHint:"Sân 400-600k/h chia 4, thuê vợt 50-100k", query:"sân padel tennis Tây Hồ Hà Nội", hot:true },
  { id:"yoga", title:"Yoga / nhảy ngoài trời", desc:"Lớp cộng đồng free / phí rẻ ở công viên sáng sớm + chiều. Đến tập ké thoải mái.", who:["mot-minh","ban-be"], budget:"free", vibe:"van-dong", time:["sang","chieu"], cost:"0-80k", priceHint:"Lớp cộng đồng free-50k", query:"lớp yoga công viên Hà Nội", hot:false },
  { id:"boxing", title:"Boxing / kickboxing / muay", desc:"Buổi trial 100-150k, có găng + HLV. Đấm bao cát xả stress cực đã.", who:["mot-minh","ban-be"], budget:"re", vibe:"van-dong", time:["chieu","toi"], cost:"100-200k/buổi", priceHint:"Trial 100-150k, gói tháng 600k-1tr", query:"phòng tập boxing Hà Nội", hot:true },
  { id:"leo-tuong", title:"Leo tường nhân tạo", desc:"Có dây bảo hiểm + HLV, newbie leo được luôn. Ảnh mang về chất lừ.", who:["ban-be","mot-minh","nguoi-yeu"], budget:"trungbinh", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"180-250k", priceHint:"Vé 180-250k gồm giày + bảo hiểm", query:"leo núi nhân tạo VietClimb Hà Nội", hot:true },
  { id:"truot-bang", title:"Trượt băng", desc:"Sân băng thật trong mall. Ngã sấp mặt nhưng vui.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"trungbinh", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"150-220k", priceHint:"Vé 150-200k/2h, thuê penguin 50k", query:"sân trượt băng Royal City Hà Nội", hot:false },
  { id:"go-kart", title:"Đua go-kart", desc:"Máu tốc độ. Mũ + xe có sẵn. Rủ hội bạn đua là cười bò.", who:["ban-be","nguoi-yeu"], budget:"cao", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"250-400k/lượt", priceHint:"250-400k/10-15p, 2 lượt ~500-700k", query:"sân go kart Long Biên Hà Nội", hot:true },
  { id:"ban-cung", title:"Bắn cung", desc:"Thử làm Hawkeye. Có cung + tên + HLV, ngầu + có ảnh đẹp.", who:["ban-be","nguoi-yeu","mot-minh"], budget:"trungbinh", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"150-250k/h", priceHint:"150-250k/h, combo 3 buổi ~500k", query:"clb bắn cung Hà Nội", hot:true },
  { id:"ban-sung", title:"Bắn súng / paintball", desc:"Súng hơi có HLV kèm 1-1, hoặc chia 2 team bắn sơn ở Sóc Sơn.", who:["ban-be","mot-minh"], budget:"cao", vibe:"van-dong", time:["chieu","cuoi-tuan"], cost:"200-450k", priceHint:"Bắn súng 200-400k/buổi, paintball 250-400k + đạn", query:"trường bắn súng paintball Hà Nội", hot:true },
  { id:"escape-room", title:"Escape room", desc:"60 phút giải đố thoát phòng. Đi team 4-5 là vui nhất.", who:["ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"kham-pha", time:["chieu","toi"], cost:"150-250k/người", priceHint:"Team 4-5 chia ~700k-1tr/phòng", query:"escape room Hà Nội", hot:true },
  { id:"cam-trai", title:"Cắm trại qua đêm", desc:"Thuê lều, nướng BBQ, ngắm sao, kể chuyện ma. Newbie chọn khu có quản lý.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"cao", vibe:"kham-pha", time:["cuoi-tuan"], cost:"250-700k/người", priceHint:"Tự túc 150-250k, full dịch vụ 400-700k", query:"khu cắm trại Sóc Sơn Đồng Đò Hàm Lợn", hot:true },
  { id:"trekking", title:"Trekking / leo núi", desc:"Hàm Lợn, Ba Vì, Núi Trầm. Mang 2L nước + đồ ăn nhẹ, đi xe máy đi về trong ngày.", who:["ban-be","nguoi-yeu"], budget:"re", vibe:"van-dong", time:["sang","cuoi-tuan"], cost:"80-250k", priceHint:"Vé 0-60k, xăng 60-120k, ăn 50-120k", query:"leo núi Hàm Lợn Ba Vì Hà Nội", hot:true },
  { id:"phuot", title:"Phượt xe máy trong ngày", desc:"Tam Đảo, Ba Vì + Đường Lâm, Đại Lải, Tràng An... Xuất phát sớm, tối về.", who:["ban-be","nguoi-yeu","gia-dinh"], budget:"trungbinh", vibe:"kham-pha", time:["cuoi-tuan"], cost:"200-600k", priceHint:"Xăng 80-150k, ăn 150-250k, vé tùy điểm", query:"phượt Tam Đảo Ba Vì trong ngày", hot:true },
  { id:"cau-ca", title:"Câu cá dịch vụ", desc:"Thuê cần, mua mồi, ngồi cả buổi bên hồ. Cá cắn hay không không quan trọng.", who:["mot-minh","ban-be","gia-dinh"], budget:"re", vibe:"chill", time:["sang","cuoi-tuan"], cost:"100-250k", priceHint:"Vé cần 100-200k, mồi 30-50k", query:"hồ câu dịch vụ Sóc Sơn Đông Anh", hot:false },
  { id:"cho-si", title:"Săn đồ si / chợ sớm", desc:"Đồ si 20-100k/món, chợ hoa đêm 2-4h sáng. Đi sáng cuối tuần nhiều hàng mới.", who:["ban-be","mot-minh"], budget:"re", vibe:"kham-pha", time:["sang","cuoi-tuan"], cost:"50-200k", priceHint:"Đồ si 20-100k/món, hoa 30-100k/bó", query:"chợ đồ si Hoàng Hoa Thám Hà Nội", hot:false },
  { id:"workshop", title:"Workshop sáng tạo", desc:"Làm gốm, vẽ tote, tufting. Một buổi có đồ mang về + ảnh.", who:["mot-minh","ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"van-hoa", time:["chieu","cuoi-tuan"], cost:"150-350k", priceHint:"150-350k gồm nguyên liệu", query:"workshop làm gốm vẽ Hà Nội", hot:true },
  { id:"sup", title:"Chèo SUP / kayak", desc:"Thuê SUP có HLV hướng dẫn, ảnh mang về toàn siêu phẩm. Nhớ mang đồ thay.", who:["ban-be","nguoi-yeu"], budget:"trungbinh", vibe:"van-dong", time:["sang","cuoi-tuan"], cost:"200-300k", priceHint:"Thuê SUP 200-300k/2h", query:"chèo SUP Hồ Tây Hà Nội", hot:true },
];

const LABELS = {
  who: { "mot-minh":"1 mình", "ban-be":"Bạn bè", "nguoi-yeu":"Người yêu", "gia-dinh":"Gia đình" },
  budget: { "free":"0đ", "re":"Dưới 100k", "trungbinh":"100-300k", "cao":"300k+" },
  vibe: { "chill":"Chill", "van-dong":"Vận động", "an-uong":"Ăn uống", "kham-pha":"Khám phá", "van-hoa":"Văn hoá" },
  time: { "sang":"Sáng", "chieu":"Chiều", "toi":"Tối", "cuoi-tuan":"Cuối tuần" },
};

// Địa điểm gợi ý sẵn cho từng hoạt động. name, address, price, note.
const PLACES = {
  "chay-bo": [
    { name:"Hồ Gươm (1 vòng ~1.7km)", address:"Hồ Hoàn Kiếm, Hoàn Kiếm, Hà Nội", price:"0đ, gửi xe 5-10k", note:"5h30 đông vui, xong ăn phở Bát Đàn" },
    { name:"Hồ Tây (1 vòng ~15km)", address:"Đường Thanh Niên, Tây Hồ, Hà Nội", price:"0đ", note:"Newbie chạy nửa vòng Phủ Tây Hồ - Thanh Niên" },
    { name:"Công viên Thống Nhất", address:"Công viên Thống Nhất, Lê Duẩn, Hà Nội", price:"Vé 4k, gửi xe 5k", note:"Đường chạy rợp cây, hồ Bảy Mẫu mát" },
    { name:"Công viên Yên Sở", address:"Công viên Yên Sở, Hoàng Mai, Hà Nội", price:"Free vé, gửi xe 10k", note:"Rộng, ít đông, chạy xong picnic luôn" },
    { name:"Cầu Long Biên - bãi giữa", address:"Cầu Long Biên, Hoàn Kiếm, Hà Nội", price:"0đ", note:"6h sáng ngắm sông Hồng + tàu hỏa" },
  ],
  "dap-xe": [
    { name:"Vòng Hồ Tây chiều mát", address:"Phủ Tây Hồ, Đặng Thai Mai, Tây Hồ, Hà Nội", price:"Thuê xe 40-80k", note:"Dừng ăn bánh tôm, kem Hồ Tây" },
    { name:"Cầu Long Biên - bãi giữa sông Hồng", address:"Bãi giữa sông Hồng, Phúc Tân, Hà Nội", price:"Thuê xe 50-80k", note:"Vườn chuối, bãi cỏ, sunset sông Hồng" },
    { name:"Ecopark đạp xe + picnic", address:"Ecopark, Văn Giang, Hưng Yên", price:"Bus free, thuê xe 50-80k", note:"Công viên Mùa Hạ - Mùa Xuân, hồ Thiên Nga" },
  ],
  "picnic": [
    { name:"Công viên Thống Nhất (hồ Bảy Mẫu)", address:"Công viên Thống Nhất, Lê Duẩn, Hà Nội", price:"Vé 4k", note:"Picnic rẻ nhất HN" },
    { name:"Công viên Yên Sở", address:"Công viên Yên Sở, Hoàng Mai, Hà Nội", price:"Free", note:"Được dựng lều qua ngày, có khu BBQ" },
    { name:"Vườn Bách Thảo", address:"Vườn Bách Thảo, Ngọc Hà, Ba Đình, Hà Nội", price:"Vé 5k", note:"Yên tĩnh nhất, hợp đọc sách một mình" },
    { name:"Bãi giữa sông Hồng", address:"Bãi giữa sông Hồng, Phúc Tân, Hà Nội", price:"Free", note:"Hoang dã giữa phố, nhớ dọn rác mang về" },
    { name:"Ecopark", address:"Ecopark, Văn Giang, Hưng Yên", price:"Bus free", note:"Đi cả ngày không chán" },
  ],
  "cafe-ngoi": [
    { name:"Cà phê Giảng (trứng, từ 1946)", address:"39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội", price:"30-35k", note:"Huyền thoại, uống nóng béo ngậy" },
    { name:"Cà phê Đinh / cà phê Cột", address:"13 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội", price:"25-40k", note:"View Hồ Gươm, cà phê trứng ngon" },
    { name:"Rooftop Tây Hồ ngắm Hồ Tây", address:"Quảng An, Tây Hồ, Hà Nội", price:"50-90k", note:"Đi tối là đẹp nhất" },
    { name:"Cà phê sách Đinh Lễ", address:"Phố sách Đinh Lễ, Hoàn Kiếm, Hà Nội", price:"30-50k", note:"Mua sách cũ + đọc ké 2 tiếng" },
  ],
  "cafe-song-ao": [
    { name:"Cụm Quảng An - Từ Hoa", address:"Quảng An, Tây Hồ, Hà Nội", price:"40-70k/quán", note:"Full quán mặt hồ, studio, minimal" },
    { name:"Xóm cà phê đường tàu Phùng Hưng", address:"Phùng Hưng, Hoàn Kiếm, Hà Nội", price:"30-50k", note:"Tàu chạy qua cách 1m, check giờ tàu trước" },
  ],
  "tra-chanh": [
    { name:"Trà chanh Nhà Thờ Lớn", address:"Nhà Thờ Lớn, Nhà Chung, Hoàn Kiếm, Hà Nội", price:"10-15k", note:"Ngồi bệt vỉa hè đến khuya" },
    { name:"Phố trà chanh Đào Duy Từ", address:"Đào Duy Từ, Hoàn Kiếm, Hà Nội", price:"10-20k", note:"Cả phố trà chanh" },
    { name:"Trà đá Quảng Bá ngắm hoàng hôn", address:"Quảng Bá, Tây Hồ, Hà Nội", price:"10k", note:"Ngắm hoàng hôn Hồ Tây" },
  ],
  "foodtour": [
    { name:"Tạ Hiện - Đồng Xuân", address:"Tạ Hiện, Hoàn Kiếm, Hà Nội", price:"150-250k là no", note:"Nem chua rán, chim quay, bánh rán mặn" },
    { name:"Phố Tống Duy Tân", address:"Tống Duy Tân, Hoàn Kiếm, Hà Nội", price:"150-250k", note:"Phố ăn đêm, gà tần, lẩu" },
    { name:"Chợ đêm Đồng Xuân", address:"Đồng Xuân, Hoàn Kiếm, Hà Nội", price:"100-200k", note:"Ốc, chè, bánh rán" },
  ],
  "tour-oc": [
    { name:"Ốc Đinh Liệt", address:"Đinh Liệt, Hoàn Kiếm, Hà Nội", price:"40-70k/bát", note:"Quán ruột dân phố cổ" },
    { name:"Ốc Trang / Ốc Chị Lệ", address:"Hà Nội", price:"50-80k", note:"Ốc luộc, ốc xào me" },
  ],
  "buffet": [
    { name:"Phố nướng Tống Duy Tân", address:"Tống Duy Tân, Hoàn Kiếm, Hà Nội", price:"150-300k", note:"Nướng Hàn, lẩu Thái" },
    { name:"Aeon Mall foodcourt + buffet", address:"Aeon Mall Long Biên, Hà Nội", price:"150-250k", note:"Nhiều lựa chọn, chơi game luôn" },
    { name:"Buffet chay Tây Hồ", address:"Tây Hồ, Hà Nội", price:"100-150k", note:"Cuối tuần reset cơ thể" },
  ],
  "sushi": [
    { name:"Phố Nhật Kim Mã", address:"Kim Mã, Ba Đình, Hà Nội", price:"150-600k", note:"Sushi băng chuyền + omakase" },
    { name:"Royal City (sushi + mall)", address:"Royal City, Thanh Xuân, Hà Nội", price:"150-300k", note:"Ăn xong chơi game center" },
  ],
  "phim-rap": [
    { name:"CGV Vincom Bà Triệu", address:"Vincom Bà Triệu, Hai Bà Trưng, Hà Nội", price:"Vé 90-250k", note:"Rạp trung tâm, nhiều suất" },
    { name:"CGV Aeon Hà Đông (IMAX)", address:"Aeon Hà Đông, Hà Nội", price:"Vé 90-250k", note:"Màn hình lớn, hợp xem bom tấn" },
    { name:"Lotte Tây Hồ", address:"Lotte Tây Hồ, Hà Nội", price:"Vé 90-200k", note:"Rạp mới, ghế ngon" },
  ],
  "phim-ngoai-troi": [
    { name:"Ecopark cinema ngoài trời (theo event)", address:"Ecopark, Văn Giang, Hưng Yên", price:"50-100k", note:"Theo lịch event Facebook" },
    { name:"Rooftop Tây Hồ cine night", address:"Tây Hồ, Hà Nội", price:"50-120k", note:"Check IG các club" },
  ],
  "bao-tang": [
    { name:"Bảo tàng Dân tộc học", address:"Nguyễn Văn Huyên, Cầu Giấy, Hà Nội", price:"Vé 40k", note:"Đẹp nhất HN, nhà rông ngoài trời" },
    { name:"Di tích Hỏa Lò (ngày 50k / đêm ~300k)", address:"1 Hỏa Lò, Hoàn Kiếm, Hà Nội", price:"50-400k", note:"Tour đêm đặt trước" },
    { name:"Hoàng thành Thăng Long + Văn Miếu", address:"19C Hoàng Diệu, Ba Đình, Hà Nội", price:"30-70k/điểm", note:"Mặc áo dài chụp ảnh" },
    { name:"VCCA Royal City", address:"Royal City, Thanh Xuân, Hà Nội", price:"0-100k", note:"Nhiều triển lãm free" },
  ],
  "show-live": [
    { name:"Nhà hát Múa rối Thăng Long", address:"57B Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội", price:"100-200k", note:"Suất diễn hàng ngày" },
    { name:"Nhà hát Lớn (kịch / hòa nhạc)", address:"1 Tràng Tiền, Hoàn Kiếm, Hà Nội", price:"200-800k", note:"Mặc đẹp đi xem một lần cho biết" },
  ],
  "karaoke": [
    { name:"Karaoke Đống Đa / Cầu Giấy", address:"Đống Đa, Hà Nội", price:"200-400k/h chia team", note:"Gom 4-5 đứa là rẻ" },
  ],
  "boardgame": [
    { name:"Boardgame cafe Cầu Giấy / Đống Đa", address:"Cầu Giấy, Hà Nội", price:"30-70k/người", note:"Ma sói, Uno đến khuya" },
  ],
  "bia": [
    { name:"Bida club Đống Đa", address:"Đống Đa, Hà Nội", price:"30-60k/h", note:"Mở đến 2h sáng" },
  ],
  "bowling": [
    { name:"Royal City / Times City bowling", address:"Royal City, Nguyễn Trãi, Thanh Xuân, Hà Nội", price:"80-150k/game", note:"Combo arcade + ăn uống" },
    { name:"Aeon Mall game center", address:"Aeon Mall Long Biên, Hà Nội", price:"100-200k xu", note:"Gắp thú, đua xe, VR" },
  ],
  "boi": [
    { name:"Bể bơi Tăng Bạt Hổ", address:"Tăng Bạt Hổ, Hai Bà Trưng, Hà Nội", price:"40-70k", note:"Bể 4 mùa, đi sáng vắng" },
    { name:"Bể Hapulico / Nghĩa Tân", address:"Hà Nội", price:"80-150k", note:"Bể tư sạch, có tủ đồ" },
  ],
  "cau-long": [
    { name:"Nhà thi đấu Cầu Giấy", address:"Cầu Giấy, Hà Nội", price:"80-150k/h", note:"Đặt sân trước buổi tối" },
  ],
  "pickleball": [
    { name:"Sân pickleball (tìm trên Maps quanh nhà)", address:"Sân Pickleball, Hà Nội", price:"150-250k/h", note:"Rủ 4 người chia là rẻ nhất" },
  ],
  "padel": [
    { name:"Club padel / tennis Tây Hồ - Long Biên", address:"Tây Hồ, Hà Nội", price:"400-600k/h chia 4", note:"Có buổi trial cho newbie" },
  ],
  "yoga": [
    { name:"Công viên Thống Nhất / Cầu Giấy (lớp cộng đồng)", address:"Công viên Cầu Giấy, Hà Nội", price:"Free-50k", note:"Sáng sớm + chiều" },
  ],
  "boxing": [
    { name:"Phòng boxing (tìm quanh nhà)", address:"Phòng tập boxing Hà Nội", price:"Trial 100-150k", note:"Có găng + HLV" },
  ],
  "leo-tuong": [
    { name:"VietClimb / Push Climbing", address:"VietClimb, Tây Hồ, Hà Nội", price:"180-250k", note:"Gồm giày + bảo hiểm" },
  ],
  "truot-bang": [
    { name:"Sân băng Royal City", address:"Royal City, 72 Nguyễn Trãi, Thanh Xuân, Hà Nội", price:"150-200k/2h", note:"Thuê penguin hỗ trợ 50k" },
  ],
  "go-kart": [
    { name:"Sân Go-kart Long Biên", address:"Sân Go Kart, Long Biên, Hà Nội", price:"250-400k/10-15p", note:"Mũ + xe có sẵn" },
    { name:"Sân Go-kart Hoàng Mai", address:"Hoàng Mai, Hà Nội", price:"250-400k", note:"Đi team 4+ vui hơn" },
  ],
  "ban-cung": [
    { name:"CLB bắn cung Tây Hồ / Cầu Giấy", address:"CLB bắn cung Tây Hồ, Hà Nội", price:"150-250k/h", note:"Gồm cung + tên + HLV" },
  ],
  "ban-sung": [
    { name:"Trường bắn Mỹ Đình / Long Biên (súng hơi)", address:"Trường bắn Mỹ Đình, Nam Từ Liêm, Hà Nội", price:"200-400k/buổi", note:"HLV kèm 1-1" },
    { name:"Sân paintball Sóc Sơn", address:"Sân paintball Sóc Sơn, Hà Nội", price:"250-400k + đạn", note:"Chia 2 team, đồ bảo hộ full" },
  ],
  "escape-room": [
    { name:"Escape room Đống Đa / Cầu Giấy", address:"Escape room Đống Đa, Hà Nội", price:"150-250k/người", note:"Team 4-5 chia ~700k-1tr/phòng" },
  ],
  "cam-trai": [
    { name:"Hồ Đồng Đò (Sóc Sơn)", address:"Hồ Đồng Đò, Minh Trí, Sóc Sơn, Hà Nội", price:"Tự túc 150-250k, full 400-700k", note:"Camp quốc dân, có lều + SUP + BBQ" },
    { name:"Hàm Lợn (săn mây + ngắm sao)", address:"Núi Hàm Lợn, Sóc Sơn, Hà Nội", price:"250-450k/người", note:"Thuê lều tại chỗ 150-300k" },
    { name:"Sơn Tinh Camp - Đồng Mô", address:"Sơn Tinh Camp, Đồng Mô, Sơn Tây, Hà Nội", price:"400-800k", note:"Lều Mông Cổ, zipline, chèo thuyền" },
    { name:"Bản Rõm Sóc Sơn (có quản lý, hợp newbie)", address:"Bản Rõm, Quang Tiến, Sóc Sơn, Hà Nội", price:"200-400k", note:"An toàn cho gia đình" },
    { name:"Hồ Quan Sơn (Mỹ Đức, mùa sen T6-7)", address:"Hồ Quan Sơn, Mỹ Đức, Hà Nội", price:"150-300k", note:"Hạ Long trên cạn của HN" },
  ],
  "trekking": [
    { name:"Núi Hàm Lợn (462m, nóc nhà thủ đô)", address:"Núi Hàm Lợn, Sóc Sơn, Hà Nội", price:"Xăng + ăn ~100-200k", note:"Leo 2-3h, sáng đi chiều về" },
    { name:"VQG Ba Vì (nhà thờ đổ, đỉnh Tản Viên)", address:"Vườn quốc gia Ba Vì, Hà Nội", price:"Vé 60k + xăng ~100k", note:"Mùa mây săn mây đẹp" },
    { name:"Núi Trầm (Chương Mỹ, dễ leo)", address:"Núi Trầm, Phụng Châu, Chương Mỹ, Hà Nội", price:"Xăng ~60k", note:"Có chùa Trầm + hang động" },
  ],
  "phuot": [
    { name:"Tam Đảo (~80km)", address:"Tam Đảo, Vĩnh Phúc", price:"250-400k/người", note:"6h xuất phát, săn mây, gà đồi + su su" },
    { name:"Ba Vì + làng cổ Đường Lâm (~55km)", address:"Làng cổ Đường Lâm, Sơn Tây, Hà Nội", price:"200-350k", note:"Sáng núi, chiều nhà cổ 300 năm" },
    { name:"Tràng An - Ninh Bình (~100km, 5h-20h)", address:"Tràng An, Ninh Bình", price:"400-600k", note:"Thuyền 250k, Hang Múa 100k, dê 150k" },
    { name:"Foodtour Hải Phòng (~120km, tàu 80-120k)", address:"Trung tâm Hải Phòng", price:"300-500k", note:"Bánh đa cua, nem cua bể, dừa dầm" },
    { name:"Chùa Tam Chúc (~70km)", address:"Chùa Tam Chúc, Kim Bảng, Hà Nam", price:"200-350k", note:"Thuyền 200-270k, ăn chay" },
  ],
  "cau-ca": [
    { name:"Hồ câu Sóc Sơn / Đông Anh", address:"Hồ câu Sóc Sơn, Hà Nội", price:"100-200k/cần/ngày", note:"Cá câu được mang về / nướng tại chỗ" },
  ],
  "cho-si": [
    { name:"Chợ Hoàng Hoa Thám / Đông Tác", address:"Chợ Hoàng Hoa Thám, Ba Đình, Hà Nội", price:"20-100k/món", note:"Sáng cuối tuần nhiều hàng mới" },
    { name:"Chợ hoa Quảng Bá (2-4h sáng)", address:"Chợ hoa Quảng Bá, Tây Hồ, Hà Nội", price:"30-100k/bó", note:"Xong ăn phở đêm" },
  ],
  "workshop": [
    { name:"Studio gốm / vẽ / tufting Đống Đa - Hoàn Kiếm", address:"Studio gốm Đống Đa, Hà Nội", price:"150-350k", note:"Gồm nguyên liệu, có đồ mang về" },
    { name:"Làng gốm Bát Tràng (nặn gốm 30-50k)", address:"Làng gốm Bát Tràng, Gia Lâm, Hà Nội", price:"100-200k", note:"Xe máy 30p, hợp gia đình" },
  ],
  "sup": [
    { name:"Bến thuyền Hồ Tây", address:"Bến thuyền Hồ Tây, Nhật Chiêu, Tây Hồ, Hà Nội", price:"200-300k/2h", note:"Có HLV, ảnh đẹp" },
    { name:"Hồ Đồng Đò (kết hợp camp)", address:"Hồ Đồng Đò, Sóc Sơn, Hà Nội", price:"200k", note:"Nước trong, bãi cỏ rộng" },
  ],
};

function mapsSearchUrl(q) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q + "");
}
function mapsDirUrl(q) {
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q + "");
}
function googleSearchUrl(q) {
  return "https://www.google.com/search?q=" + encodeURIComponent(q + "");
}
