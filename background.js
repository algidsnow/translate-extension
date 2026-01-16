// Lắng nghe tin nhắn từ content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request);
  
  // Xử lý yêu cầu Dịch
  if (request.action === "TRANSLATE") {
    console.log('[Background] Processing TRANSLATE for:', request.text);
    translateText(request.text).then(translatedText => {
      console.log('[Background] Translation success:', translatedText);
      sendResponse({ success: true, data: translatedText });
    }).catch(error => {
      console.error('[Background] Translation error:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Giữ kết nối để trả về bất đồng bộ
  }

  // Xử lý yêu cầu Lưu
  if (request.action === "SAVE") {
    saveToStorage(request.original, request.translated, request.ipa, request.wordType);
    sendResponse({ success: true });
  }
});

async function translateText(text) {
  // Gọi cả 2 API song song để tăng tốc độ
  const [translationResult, dictionaryResult] = await Promise.all([
    // 1. MyMemory Translation API
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`)
      .then(res => res.json()),
    // 2. Free Dictionary API (lấy IPA và loại từ)
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.toLowerCase())}`)
      .then(res => res.json())
      .catch(() => null) // Bỏ qua nếu lỗi
  ]);
  
  console.log('[Background] Translation Response:', JSON.stringify(translationResult, null, 2));
  console.log('[Background] Dictionary Response:', JSON.stringify(dictionaryResult, null, 2));
  
  // Kiểm tra lỗi từ Translation API
  if (translationResult.responseStatus !== 200) {
    throw new Error(translationResult.responseDetails || 'Translation API Error');
  }
  
  // Lấy IPA và loại từ từ Dictionary API
  let ipa = '';
  let wordType = '';
  
  if (Array.isArray(dictionaryResult) && dictionaryResult[0]) {
    const entry = dictionaryResult[0];
    
    // Lấy IPA (phonetic)
    if (entry.phonetic) {
      ipa = entry.phonetic;
    } else if (entry.phonetics && entry.phonetics.length > 0) {
      // Tìm phonetic có text
      const phoneticWithText = entry.phonetics.find(p => p.text);
      ipa = phoneticWithText ? phoneticWithText.text : '';
    }
    
    // Lấy loại từ (part of speech)
    if (entry.meanings && entry.meanings.length > 0) {
      // Lấy tất cả loại từ và gộp lại
      const types = entry.meanings.map(m => m.partOfSpeech);
      wordType = [...new Set(types)].join(', '); // Loại bỏ trùng lặp
    }
  }
  
  return {
    translated: translationResult.responseData.translatedText,
    ipa: ipa,
    wordType: wordType
  };
}

function saveToStorage(original, translated, ipa, wordType) {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const newList = result.vocabList;
    newList.unshift({
      original: original,
      translated: translated,
      ipa: ipa || '',
      wordType: wordType || '',
      date: new Date().toLocaleDateString('vi-VN')
    });
    chrome.storage.local.set({ vocabList: newList });
  });
}