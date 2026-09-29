# TouchGrass — Mở Hòm Đi Chơi Hà Nội

Random hoạt động + địa điểm quanh Hà Nội kiểu mở hòm CS2. Web tĩnh, mở `index.html` là chạy.

## Chạy local

Mở file `index.html` bằng browser, hoặc chạy server tĩnh:

```powershell
python -m http.server 8000
# mở http://localhost:8000
```

## Tính năng

- Hòm 1: random hoạt động (37 hoạt động có sẵn + hoạt động AI)
- Hòm 2: random địa điểm, có link Google Maps / chỉ đường / tìm review
- Tab Kho AI: dùng Gemini API để gom 50-100 địa điểm cho mỗi hoạt động, lưu localStorage
- Theme tối, âm thanh WebAudio, không cần build
