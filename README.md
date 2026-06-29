# 📖 Vocab Helper — Chrome Extension

Extension dịch từ vựng tiếng Anh bằng **Ollama AI** (chạy local), lưu từ lên **Supabase** cloud và đọc từ bằng **Text-to-Speech**.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🤖 **Dịch bằng Ollama** | Bôi đen từ → Click G → Dịch chính xác bằng LLM local |
| 📚 **IPA & Loại từ** | Hiển thị phiên âm, loại từ (noun/verb/adj...) và câu ví dụ |
| 🔤 **Word Family** | Tự động tìm các từ cùng họ (development, developer...) |
| 🔊 **Text-to-Speech** | Đọc từ tiếng Anh chuẩn giọng en-US |
| ☁️ **Supabase Cloud** | Lưu từ vựng lên cloud, đồng bộ nhiều thiết bị |
| 📝 **Annotation** | Hiển thị nghĩa tiếng Việt ngay trên trang web |

---

## 🛠️ Yêu cầu hệ thống

- **Chrome** / Chromium-based browser (Edge, Brave...)
- **Ollama** (chạy local)
- **Supabase** account (tùy chọn, để sync cloud)

---

## 🍎 Setup trên macOS

### Bước 1: Cài Ollama

```bash
# Cài qua Homebrew
brew install ollama

# HOẶC tải từ https://ollama.com/download
```

### Bước 2: Pull model

```bash
ollama pull gemma4:31b-cloud
# Hoặc model khác: llama3, qwen2.5, mistral...
```

### Bước 3: Chạy Ollama với CORS (bắt buộc cho Extension)

> ⚠️ **QUAN TRỌNG**: Phải chạy bằng lệnh này, KHÔNG mở Ollama.app từ menu bar.

```bash
OLLAMA_ORIGINS="*" ollama serve
```

**Để chạy tự động mỗi lần bật máy**, tạo script:

```bash
# Tạo file ~/start-ollama.sh
cat > ~/start-ollama.sh << 'EOF'
#!/bin/bash
OLLAMA_ORIGINS="*" ollama serve
EOF

chmod +x ~/start-ollama.sh
```

Sau đó chạy `~/start-ollama.sh` mỗi khi cần dùng extension.

### Bước 4: Load Extension vào Chrome

1. Mở Chrome → `chrome://extensions`
2. Bật **Developer mode** (góc trên phải)
3. Click **"Load unpacked"**
4. Chọn thư mục project này

### Bước 5: Cấu hình Extension

1. Click icon Extension trên toolbar Chrome
2. Chuyển sang tab **⚙️ Cài Đặt**
3. Điền:
   - **Ollama URL**: `http://localhost:11434`
   - **Model**: `gemma4:31b-cloud`
4. Click **💾 Lưu Cài Đặt**

---

## 🪟 Setup trên Windows

### Bước 1: Cài Ollama

Tải installer từ [https://ollama.com/download/windows](https://ollama.com/download/windows) → Cài đặt bình thường.

### Bước 2: Pull model

Mở **Command Prompt** hoặc **PowerShell**:

```powershell
ollama pull gemma4:31b-cloud
```

### Bước 3: Chạy Ollama với CORS (bắt buộc)

> ⚠️ **QUAN TRỌNG**: Phải đặt biến môi trường trước khi chạy. KHÔNG dùng Ollama từ system tray.

**Cách A — PowerShell (tạm thời, mỗi lần mở terminal mới):**

```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

**Cách B — Đặt vĩnh viễn qua System Environment Variables:**

1. Nhấn `Win + S` → tìm **"Edit the system environment variables"**
2. Click **"Environment Variables..."**
3. Trong **"User variables"** → click **New**:
   - Variable name: `OLLAMA_ORIGINS`
   - Variable value: `*`
4. Click OK → **Restart máy tính**
5. Sau khi restart, chỉ cần chạy `ollama serve` bình thường

**Cách C — Tạo file batch để chạy nhanh:**

```batch
@echo off
REM Lưu file này là: start-ollama.bat
SET OLLAMA_ORIGINS=*
ollama serve
pause
```

Double-click file `.bat` này mỗi khi cần dùng extension.

### Bước 4: Load Extension vào Chrome

1. Mở Chrome → `chrome://extensions`
2. Bật **Developer mode** (góc trên phải)
3. Click **"Load unpacked"**
4. Chọn thư mục project này

### Bước 5: Cấu hình Extension

1. Click icon Extension trên toolbar Chrome
2. Chuyển sang tab **⚙️ Cài Đặt**
3. Điền:
   - **Ollama URL**: `http://localhost:11434`
   - **Model**: `gemma4:31b-cloud`
4. Click **💾 Lưu Cài Đặt**

---

## ☁️ Cài đặt Supabase (tùy chọn)

Nếu muốn đồng bộ từ vựng qua nhiều thiết bị:

### Bước 1: Tạo bảng trong Supabase

1. Đăng ký/đăng nhập tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Vào **SQL Editor** → chạy lệnh sau:

```sql
CREATE TABLE vocab_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original TEXT NOT NULL,
  translated TEXT,
  ipa TEXT,
  word_type TEXT,
  example TEXT,
  parentId TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tắt RLS để extension có thể đọc/ghi
ALTER TABLE vocab_words DISABLE ROW LEVEL SECURITY;
```

### Bước 2: Lấy API credentials

Vào **Project Settings → API**:
- Copy **Project URL** (dạng `https://xxxx.supabase.co`)
- Copy **anon/public key**

### Bước 3: Điền vào Extension Settings

Tab **⚙️ Cài Đặt** → phần **Supabase Cloud**:
- **Supabase URL**: `https://xxxx.supabase.co`
- **Supabase Anon Key**: `eyJhbGci...`

---

## 🚀 Cách sử dụng

1. **Bôi đen từ** tiếng Anh bất kỳ trên trang web
2. Click nút **G** màu tím xuất hiện
3. Đợi Ollama xử lý (5-30 giây tùy model)
4. Popup hiện kết quả:
   - **Từ gốc** + IPA + Loại từ
   - **Nghĩa tiếng Việt**
   - **Câu ví dụ**
   - Nút **🔊** để nghe đọc
   - Nút **💾 Lưu từ này**
5. Mở popup Extension để xem **danh sách từ vựng** đã lưu

---

## 🔧 Troubleshooting

### ❌ Lỗi 403 (Forbidden)
Ollama đang chạy mà không có CORS. Xem **Bước 3** — phải chạy với `OLLAMA_ORIGINS="*"`.

### ❌ Lỗi "Connection refused" hoặc không kết nối được
Ollama chưa chạy. Chạy lệnh start Ollama trước.

### ❌ Lỗi "The message port closed"
Reload extension: vào `chrome://extensions` → click nút **🔄** (reload) trên extension.

### ❌ Dịch rất chậm
Model lớn cần thời gian. `gemma4:31b-cloud` mất 10-30 giây. Có thể đổi sang model nhỏ hơn:
```bash
ollama pull llama3.2:3b
# Rồi đổi model trong Settings
```

### ❌ Lỗi Supabase 400/404
Kiểm tra bảng `vocab_words` đã được tạo chưa và RLS đã tắt chưa.

---

## 📁 Cấu trúc project

```
extension-transale/
├── manifest.json      # Chrome extension config
├── background.js      # Service worker: Ollama API, Supabase
├── content.js         # UI nổi trên trang web (nút G, popup dịch)
├── popup.html         # Popup chính (danh sách từ + settings)
├── popup.js           # Logic popup
├── knowledge.js       # Panel kiến thức ngữ pháp
├── styles.css         # Style cho content script
└── README.md          # File này
```

---

## ⚙️ Các model Ollama được test

| Model | Kích thước | Tốc độ | Chất lượng |
|---|---|---|---|
| `gemma4:31b-cloud` | ~20GB | Chậm | ⭐⭐⭐⭐⭐ |
| `qwen2.5:14b` | ~9GB | Trung bình | ⭐⭐⭐⭐ |
| `llama3.2:3b` | ~2GB | Nhanh | ⭐⭐⭐ |
| `mistral:7b` | ~4GB | Trung bình | ⭐⭐⭐⭐ |
