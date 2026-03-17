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
    return true;
  }

  // Xử lý yêu cầu Lưu (async vì phải tìm từ liên quan)
  if (request.action === "SAVE") {
    saveToStorage(request.original, request.translated, request.ipa, request.wordType)
      .then(() => sendResponse({ success: true }))
      .catch(err => {
        console.error('[Background] Save error:', err);
        sendResponse({ success: true });
      });
    return true;
  }
});

// ===== DỊCH =====

async function translateText(text) {
  const [translationResult, dictionaryResult] = await Promise.all([
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi&de=hocvalamngay@gmail.com`)
      .then(res => res.json())
      .catch(err => { throw new Error('MyMemory API error: ' + err.message); }),
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.toLowerCase())}`)
      .then(res => res.json())
      .catch(() => null)
  ]);
  
  if (translationResult.responseStatus != 200) {
    throw new Error(translationResult.responseDetails || 'Translation API Error');
  }
  
  const { ipa, wordType } = extractDictionaryInfo(dictionaryResult);
  
  return {
    translated: translationResult.responseData.translatedText,
    ipa,
    wordType
  };
}

// Trích xuất IPA và loại từ từ Dictionary API response
function extractDictionaryInfo(dictionaryResult) {
  let ipa = '';
  let wordType = '';
  
  if (Array.isArray(dictionaryResult) && dictionaryResult[0]) {
    const entry = dictionaryResult[0];
    
    if (entry.phonetic) {
      ipa = entry.phonetic;
    } else if (entry.phonetics && entry.phonetics.length > 0) {
      const phoneticWithText = entry.phonetics.find(p => p.text);
      ipa = phoneticWithText ? phoneticWithText.text : '';
    }
    
    if (entry.meanings && entry.meanings.length > 0) {
      const types = entry.meanings.map(m => m.partOfSpeech);
      wordType = [...new Set(types)].join(', ');
    }
  }
  
  return { ipa, wordType };
}

// ===== TÌM TỪ LIÊN QUAN BẰNG DATAMUSE API =====

async function getRelatedWordsFromDatamuse(word) {
  try {
    const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=5`);
    if (!response.ok) return [];
    const data = await response.json();
    const candidates = data.map(item => item.word);
    
    // Lọc bỏ từ gốc nếu có (tránh trùng lặp)
    const filtered = candidates.filter(c => c.toLowerCase() !== word.toLowerCase());
    
    console.log(`[Background] Generated related words from Datamuse for "${word}":`, filtered);
    return filtered;
  } catch (err) {
    console.error('[Background] Datamuse API error:', err); 
    return [];
  }
}

// ===== VALIDATE TỪ BẰNG DICTIONARY API =====

async function validateAndTranslateWord(word) {
  try {
    const [translationResult, dictionaryResult] = await Promise.all([
      fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|vi&de=hocvalamngay@gmail.com`)
        .then(res => res.json()),
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`)
        .then(res => res.json())
        .catch(() => null)
    ]);

    // Nếu Dictionary API không tìm thấy từ → từ không hợp lệ
    if (!Array.isArray(dictionaryResult) || !dictionaryResult[0]) {
      return null;
    }

    const { ipa, wordType } = extractDictionaryInfo(dictionaryResult);
    const translated = translationResult?.responseData?.translatedText || word;

    return { original: word, translated, ipa, wordType };
  } catch (error) {
    console.error(`[Background] Validate error for "${word}":`, error);
    return null;
  }
}

// ===== LƯU TỪ + TỪ LIÊN QUAN =====

async function saveToStorage(original, translated, ipa, wordType) {
  return new Promise((resolve) => {
    chrome.storage.local.get({ vocabList: [] }, async (result) => {
      const newList = result.vocabList;
      const today = new Date().toLocaleDateString('vi-VN');

      // 1. Lưu từ chính ngay lập tức
      newList.unshift({
        original: original,
        translated: translated,
        ipa: ipa || '',
        wordType: wordType || '',
        date: today
      });
      chrome.storage.local.set({ vocabList: newList });

      // 2. Tìm từ liên quan bằng Datamuse API (chạy nền)
      try {
        const candidates = await getRelatedWordsFromDatamuse(original);
        
        if (candidates.length === 0) {
          resolve();
          return;
        }

        // 3. Validate song song từng batch 5 từ (tránh quá tải API)
        const validatedWords = [];
        // Lấy từng từ một thay vì 5 từ cùng lúc để tránh làm MyMemory API khóa IP (Rate Limit)
        for (const w of candidates) {
          const res = await validateAndTranslateWord(w);
          if (res) validatedWords.push(res);
          // Tạm dừng 300ms giữa mỗi lần gọi API
          await new Promise(r => setTimeout(r, 300));
          
          if (validatedWords.length >= 3) break;
        }
        
        // 4. Lọc từ hợp lệ và chưa có trong danh sách
        chrome.storage.local.get({ vocabList: [] }, (latestResult) => {
          const currentList = latestResult.vocabList;
          const existingWords = new Set(currentList.map(item => item.original.toLowerCase()));

          const newRelatedWords = validatedWords
            .filter(vw => vw !== null && !existingWords.has(vw.original.toLowerCase()))
            .map(vw => ({
              original: vw.original,
              translated: vw.translated,
              ipa: vw.ipa,
              wordType: vw.wordType,
              date: today,
              relatedTo: original
            }));

          if (newRelatedWords.length > 0) {
            const mainWordIndex = currentList.findIndex(
              item => item.original.toLowerCase() === original.toLowerCase() && !item.relatedTo
            );
            const insertAt = mainWordIndex >= 0 ? mainWordIndex + 1 : 1;
            currentList.splice(insertAt, 0, ...newRelatedWords);
            
            chrome.storage.local.set({ vocabList: currentList });
            console.log(`[Background] Added ${newRelatedWords.length} related words for "${original}":`, 
              newRelatedWords.map(w => `${w.original} (${w.wordType})`));
          }
          resolve();
        });
      } catch (error) {
        console.error('[Background] Error finding related words:', error);
        resolve();
      }
    });
  });
}