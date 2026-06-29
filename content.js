let geminiButton = null;
let translationPopup = null;

// 1. Lắng nghe sự kiện nhả chuột (khi bôi đen xong)
document.addEventListener('mouseup', (event) => {
  if (geminiButton && (event.target === geminiButton || geminiButton.contains(event.target))) return;
  if (translationPopup && (event.target === translationPopup || translationPopup.contains(event.target))) return;

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showButton(rect.right, rect.top + window.scrollY, selectedText);
  } else {
    removeElements();
  }
});

// Hàm hiển thị nút icon G
function showButton(x, y, text) {
  removeElements();

  const selection = window.getSelection();
  let savedRange = null;
  if (selection.rangeCount > 0) {
    savedRange = selection.getRangeAt(0).cloneRange();
  }

  geminiButton = document.createElement('button');
  geminiButton.innerText = 'G';
  geminiButton.className = 'gemini-floating-btn';
  geminiButton.style.left = `${x + 5}px`;
  geminiButton.style.top = `${y - 30}px`;

  geminiButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    showLoadingPopup(x, y);

    chrome.runtime.sendMessage({ action: 'TRANSLATE', text }, (response) => {
      if (chrome.runtime.lastError) {
        showErrorPopup(x, y, 'Lỗi kết nối: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        showResultPopup(x, y, text, response.data, savedRange);
      } else {
        showErrorPopup(x, y, response?.error || 'Không có phản hồi');
      }
    });
  });

  document.body.appendChild(geminiButton);
}

// Hàm thêm annotation trực tiếp lên trang
function addInlineAnnotation(range, originalText, translatedText) {
  try {
    const wrapper = document.createElement('span');
    wrapper.className = 'gemini-annotation';
    wrapper.innerHTML = `
      <span class="gemini-annotation-vn">${translatedText}</span>
      <span class="gemini-annotation-en">${originalText}</span>
    `;
    range.deleteContents();
    range.insertNode(wrapper);
    window.getSelection().removeAllRanges();
  } catch (error) {
    console.error('[Gemini] Error adding annotation:', error);
  }
}

// Hàm hiện popup Loading
function showLoadingPopup(x, y) {
  removeElements();
  translationPopup = document.createElement('div');
  translationPopup.className = 'gemini-popup gemini-popup-above';
  translationPopup.innerHTML = `
    <div class="g-loading">
      <div class="g-spinner"></div>
      <span>Đang dịch bằng Gemini...</span>
    </div>
  `;
  translationPopup.style.left = `${x}px`;
  translationPopup.style.top = `${y - 60}px`;
  document.body.appendChild(translationPopup);
}

// Hàm hiện popup Lỗi
function showErrorPopup(x, y, message) {
  if (translationPopup) translationPopup.remove();
  translationPopup = document.createElement('div');
  translationPopup.className = 'gemini-popup gemini-popup-above';
  translationPopup.style.left = `${x}px`;
  translationPopup.style.top = `${y - 60}px`;
  translationPopup.innerHTML = `<div class="g-error">⚠️ ${message}</div>`;
  document.body.appendChild(translationPopup);
}

// Hàm phát âm từ bằng Web Speech API
function speakWord(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.9;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// Hàm hiện popup Kết quả và nút Lưu
function showResultPopup(x, y, original, data, savedRange) {
  if (translationPopup) translationPopup.remove();

  translationPopup = document.createElement('div');
  translationPopup.className = 'gemini-popup gemini-popup-above';
  translationPopup.style.left = `${x}px`;
  translationPopup.style.top = `${y - 120}px`;

  const ipaHtml = data.ipa ? `<span class="g-ipa">${data.ipa}</span>` : '';
  const wordTypeHtml = data.wordType ? `<div class="g-word-type">${data.wordType}</div>` : '';
  const exampleHtml = data.example ? `<div class="g-example">"${data.example}"</div>` : '';

  translationPopup.innerHTML = `
    <div class="g-header">
      <div class="g-word-row">
        <span class="g-original-word">${original}</span>
        ${ipaHtml}
        <button class="g-tts-btn" title="Đọc từ">🔊</button>
      </div>
      ${wordTypeHtml}
    </div>
    <div class="g-translated-text">${data.translated}</div>
    ${exampleHtml}
    <button id="g-save-btn">💾 Lưu từ này</button>
  `;

  document.body.appendChild(translationPopup);

  // Nút đọc từ
  translationPopup.querySelector('.g-tts-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    speakWord(original);
  });

  // Nút Lưu
  document.getElementById('g-save-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = document.getElementById('g-save-btn');
    btn.innerText = '⏳ Đang lưu...';
    btn.disabled = true;

    chrome.runtime.sendMessage({
      action: 'SAVE',
      original,
      translated: data.translated,
      ipa: data.ipa || '',
      wordType: data.wordType || '',
      example: data.example || ''
    }, (response) => {
      if (chrome.runtime.lastError) {
        btn.innerText = '❌ Lỗi kết nối';
        btn.style.background = '#f44336';
        btn.disabled = false;
        setTimeout(removeElements, 2000);
        return;
      }
      if (response && response.success) {
        if (response.isDuplicate) {
          btn.innerText = '⚠️ Đã lưu (trùng)';
          btn.style.background = '#f59e0b';
          btn.title = 'Từ này đã có trong danh sách (từ chính hoặc gia đình từ).';
        } else if (response.supabaseSaved) {
          btn.innerText = '☁️ Đã lưu cloud!';
          btn.style.background = '#4caf50';
        } else {
          btn.innerText = '💾 Đã lưu (local)';
          btn.style.background = '#f59e0b';
          btn.title = 'Supabase chưa sync — kiểm tra bảng vocab_words';
        }
        if (savedRange) {
          addInlineAnnotation(savedRange, original, data.translated);
        }
      } else {
        btn.innerText = '❌ Lỗi lưu';
        btn.style.background = '#f44336';
        if (response && response.error) {
          alert(`Thất bại:\n\n${response.error}`);
        }
      }
      btn.disabled = false;
      setTimeout(removeElements, 2000);
    });

  });
}

// Hàm dọn dẹp giao diện
function removeElements() {
  if (geminiButton) { geminiButton.remove(); geminiButton = null; }
  if (translationPopup) { translationPopup.remove(); translationPopup = null; }
}

// Click ra ngoài để đóng popup
document.addEventListener('mousedown', (e) => {
  if (translationPopup && !translationPopup.contains(e.target) && e.target !== geminiButton) {
    removeElements();
  }
});