let geminiButton = null;
let translationPopup = null;

// 1. Lắng nghe sự kiện nhả chuột (khi bôi đen xong)
document.addEventListener('mouseup', (event) => {
  // Bỏ qua nếu click vào nút G hoặc popup
  if (geminiButton && (event.target === geminiButton || geminiButton.contains(event.target))) {
    return;
  }
  if (translationPopup && (event.target === translationPopup || translationPopup.contains(event.target))) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // Nếu có bôi đen text
  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect(); // Lấy vị trí bôi đen
    
    // Hiện nút icon tại vị trí bôi đen
    showButton(rect.right, rect.top + window.scrollY, selectedText);
  } else {
    // Nếu click ra ngoài thì ẩn mọi thứ
    removeElements();
  }
});

// Hàm hiển thị nút icon
function showButton(x, y, text) {
  removeElements(); // Xóa icon cũ nếu có

  // Lưu selection range để sử dụng sau khi dịch
  const selection = window.getSelection();
  let savedRange = null;
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  geminiButton = document.createElement('button');
  geminiButton.innerText = "G"; // Icon chữ G hoặc bạn có thể dùng <img>
  geminiButton.className = "gemini-floating-btn";
  geminiButton.style.left = `${x + 5}px`;
  geminiButton.style.top = `${y - 30}px`;

  // Sự kiện khi bấm vào icon
  geminiButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
    e.preventDefault();
    
    console.log('[Gemini] Button clicked, text:', text);
    showLoadingPopup(x, y); // Hiện popup loading
    
    // Gửi tin nhắn yêu cầu dịch tới background
    console.log('[Gemini] Sending message to background...');
    chrome.runtime.sendMessage({ action: "TRANSLATE", text: text }, (response) => {
      console.log('[Gemini] Got response:', response);
      if (chrome.runtime.lastError) {
        console.error('[Gemini] Runtime error:', chrome.runtime.lastError);
        alert("Lỗi kết nối: " + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        showResultPopup(x, y, text, response.data); // Hiện kết quả
        // Thêm annotation lên trang
        if (savedRange) {
          addInlineAnnotation(savedRange, text, response.data.translated);
        }
      } else {
        alert("Lỗi dịch: " + (response?.error || "Không có phản hồi"));
      }
    });
  });

  document.body.appendChild(geminiButton);
}

// Hàm thêm annotation trực tiếp lên trang (sẽ ở đó đến khi reload)
function addInlineAnnotation(range, originalText, translatedText) {
  try {
    // Tạo wrapper element với nghĩa tiếng Việt phía trên
    const wrapper = document.createElement('span');
    wrapper.className = 'gemini-annotation';
    wrapper.innerHTML = `
      <span class="gemini-annotation-vn">${translatedText}</span>
      <span class="gemini-annotation-en">${originalText}</span>
    `;
    
    // Xóa text cũ và chèn wrapper mới
    range.deleteContents();
    range.insertNode(wrapper);
    
    // Xóa selection
    window.getSelection().removeAllRanges();
  } catch (error) {
    console.error('[Gemini] Error adding annotation:', error);
  }
}

// Hàm hiện popup Loading
function showLoadingPopup(x, y) {
  removeElements();
  translationPopup = document.createElement('div');
  translationPopup.className = "gemini-popup gemini-popup-above";
  translationPopup.innerText = "Đang dịch...";
  translationPopup.style.left = `${x}px`;
  translationPopup.style.top = `${y - 50}px`; // Hiển thị phía trên từ
  document.body.appendChild(translationPopup);
}

// Hàm hiện popup Kết quả và nút Lưu
function showResultPopup(x, y, original, data) {
  if(translationPopup) translationPopup.remove();

  translationPopup = document.createElement('div');
  translationPopup.className = "gemini-popup gemini-popup-above";
  translationPopup.style.left = `${x}px`;
  // Tạm đặt vị trí, sẽ điều chỉnh sau khi render
  translationPopup.style.top = `${y - 80}px`; // Hiển thị phía trên từ

  // Tạo nội dung hiển thị IPA và loại từ
  let ipaHtml = data.ipa ? `<div class="g-ipa">${data.ipa}</div>` : '';
  let wordTypeHtml = data.wordType ? `<div class="g-word-type">${data.wordType}</div>` : '';

  // Nội dung popup
  translationPopup.innerHTML = `
    ${ipaHtml}
    ${wordTypeHtml}
    <div class="g-translated-text">${data.translated}</div>
    <button id="g-save-btn">Lưu từ này</button>
  `;

  document.body.appendChild(translationPopup);

  // Xử lý nút Lưu
  document.getElementById('g-save-btn').onclick = () => {
    chrome.runtime.sendMessage({ 
      action: "SAVE", 
      original: original, 
      translated: data.translated,
      ipa: data.ipa,
      wordType: data.wordType
    });
    
    // Đổi nút thành "Đã lưu" và đóng sau 1s
    const btn = document.getElementById('g-save-btn');
    btn.innerText = "Đã lưu ✓";
    btn.style.background = "#4caf50";
    setTimeout(removeElements, 1000);
  };
}

// Hàm dọn dẹp giao diện
function removeElements() {
  if (geminiButton) {
    geminiButton.remove();
    geminiButton = null;
  }
  if (translationPopup) {
    translationPopup.remove();
    translationPopup = null;
  }
}

// Xử lý click ra ngoài để đóng popup
document.addEventListener('mousedown', (e) => {
  if (translationPopup && !translationPopup.contains(e.target) && e.target !== geminiButton) {
    removeElements();
  }
});