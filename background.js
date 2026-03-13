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

// ===== TÌM TỪ LIÊN QUAN BẰNG SUFFIX PATTERNS =====

function generateRelatedForms(word) {
  const w = word.toLowerCase();
  const candidates = new Set();
  
  // ===== ADJECTIVE → NOUN =====
  if (w.endsWith('ent')) candidates.add(w.slice(0, -3) + 'ence', w.slice(0, -3) + 'ency');
  if (w.endsWith('ant')) candidates.add(w.slice(0, -3) + 'ance', w.slice(0, -3) + 'ancy');
  if (w.endsWith('ive')) candidates.add(w.slice(0, -3) + 'ivity', w.slice(0, -1) + 'ness');
  if (w.endsWith('ous')) candidates.add(w.slice(0, -3) + 'osity', w + 'ness');
  if (w.endsWith('ful')) candidates.add(w + 'ness');
  if (w.endsWith('less')) candidates.add(w + 'ness');
  if (w.endsWith('al')) candidates.add(w + 'ity', w.slice(0, -2) + 'ality');
  if (w.endsWith('ible')) candidates.add(w.slice(0, -4) + 'ibility');
  if (w.endsWith('able')) candidates.add(w.slice(0, -4) + 'ability');
  if (w.endsWith('ic')) candidates.add(w.slice(0, -2) + 'icism', w.slice(0, -2) + 'ics');
  if (w.endsWith('ical')) candidates.add(w.slice(0, -4) + 'ics');
  if (w.endsWith('ious') || w.endsWith('eous')) candidates.add(w.slice(0, -4) + 'ion');
  if (w.endsWith('ive')) candidates.add(w.slice(0, -3) + 'ion', w.slice(0, -3) + 'tion');
  if (w.endsWith('ous')) candidates.add(w.slice(0, -3) + 'or', w.slice(0, -3) + 'our');

  // ===== ADJECTIVE → ADVERB =====
  if (w.endsWith('le')) {
    candidates.add(w.slice(0, -2) + 'ly');
  } else if (w.endsWith('ic')) {
    candidates.add(w + 'ally');
  } else if (w.endsWith('y')) {
    candidates.add(w.slice(0, -1) + 'ily');
  } else if (w.endsWith('ful') || w.endsWith('less') || w.endsWith('ous') || 
             w.endsWith('ive') || w.endsWith('al') || w.endsWith('ent') || 
             w.endsWith('ant') || w.endsWith('ible') || w.endsWith('able')) {
    candidates.add(w + 'ly');
  } else {
    candidates.add(w + 'ly'); // Mặc định thử thêm -ly
  }

  // ===== NOUN → ADJECTIVE =====
  if (w.endsWith('tion') || w.endsWith('sion')) candidates.add(w.slice(0, -3) + 'nal', w.slice(0, -4) + 'tive');
  if (w.endsWith('ation')) candidates.add(w.slice(0, -5) + 'ative');
  if (w.endsWith('ness')) candidates.add(w.slice(0, -4)); // happiness → happy
  if (w.endsWith('ity')) candidates.add(w.slice(0, -3) + 'ive', w.slice(0, -3) + 'al', w.slice(0, -4) + 'le', w.slice(0, -3) + 'ous');
  if (w.endsWith('ence') || w.endsWith('ance')) candidates.add(w.slice(0, -4) + 'ent', w.slice(0, -4) + 'ant');
  if (w.endsWith('ency') || w.endsWith('ancy')) candidates.add(w.slice(0, -4) + 'ent', w.slice(0, -4) + 'ant');
  if (w.endsWith('ment')) candidates.add(w.slice(0, -4) + 'al', w.slice(0, -4));
  if (w.endsWith('dom')) candidates.add(w.slice(0, -3));
  if (w.endsWith('ship')) candidates.add(w.slice(0, -4));

  // ===== NOUN → VERB =====
  if (w.endsWith('tion')) candidates.add(w.slice(0, -4) + 'te', w.slice(0, -5) + 'e', w.slice(0, -4));
  if (w.endsWith('ation')) candidates.add(w.slice(0, -5) + 'e', w.slice(0, -5), w.slice(0, -5) + 'ate');
  if (w.endsWith('sion')) candidates.add(w.slice(0, -4) + 'd', w.slice(0, -4) + 'de');
  if (w.endsWith('ment')) candidates.add(w.slice(0, -4));
  if (w.endsWith('ance') || w.endsWith('ence')) candidates.add(w.slice(0, -4) + 'e', w.slice(0, -4));
  if (w.endsWith('al')) candidates.add(w.slice(0, -2) + 'e', w.slice(0, -2));
  if (w.endsWith('er') || w.endsWith('or')) candidates.add(w.slice(0, -2), w.slice(0, -2) + 'e', w.slice(0, -1));

  // ===== VERB → NOUN =====
  if (w.endsWith('ate')) candidates.add(w.slice(0, -1) + 'ion', w.slice(0, -1) + 'or');
  if (w.endsWith('ify')) candidates.add(w.slice(0, -3) + 'ification');
  if (w.endsWith('ize') || w.endsWith('ise')) candidates.add(w.slice(0, -3) + 'ization', w.slice(0, -3) + 'isation');
  if (w.endsWith('e')) candidates.add(w.slice(0, -1) + 'ation', w.slice(0, -1) + 'ion', w + 'ment', w.slice(0, -1) + 'er');
  if (!w.endsWith('e')) {
    candidates.add(w + 'ation', w + 'tion', w + 'ment', w + 'er', w + 'or');
  }

  // ===== VERB → ADJECTIVE =====
  if (w.endsWith('ate')) candidates.add(w.slice(0, -1) + 'ive');
  if (w.endsWith('e')) candidates.add(w.slice(0, -1) + 'able', w.slice(0, -1) + 'ible', w.slice(0, -1) + 'ive');
  if (!w.endsWith('e')) candidates.add(w + 'able', w + 'ible', w + 'ive');

  // ===== ADVERB → ADJECTIVE (bỏ -ly) =====
  if (w.endsWith('ly')) {
    candidates.add(w.slice(0, -2));        // quickly → quick
    candidates.add(w.slice(0, -2) + 'le');  // simply → simple
    candidates.add(w.slice(0, -3) + 'y');   // happily → happy
    candidates.add(w.slice(0, -4) + 'al');  // traditionally → traditional (via -ally)
  }

  // ===== GENERAL: Prefix patterns (un-, in-, im-, dis-, re-) =====
  if (w.startsWith('un')) candidates.add(w.slice(2));
  if (w.startsWith('in') && !w.startsWith('inter')) candidates.add(w.slice(2));
  if (w.startsWith('im')) candidates.add(w.slice(2));
  if (w.startsWith('dis')) candidates.add(w.slice(3));
  if (w.startsWith('re') && w.length > 4) candidates.add(w.slice(2));
  // Thêm dạng phủ định
  if (!w.startsWith('un') && !w.startsWith('in') && !w.startsWith('im') && !w.startsWith('dis')) {
    candidates.add('un' + w);
    candidates.add('in' + w);
  }

  // Loại bỏ từ gốc và từ rỗng
  candidates.delete(w);
  candidates.delete('');
  
  // Loại bỏ từ quá ngắn (< 3 ký tự) hoặc quá dài
  const filtered = [...candidates].filter(c => c.length >= 3 && c.length <= 20);
  
  console.log(`[Background] Generated ${filtered.length} candidates for "${word}":`, filtered);
  return filtered;
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

      // 2. Tìm từ liên quan bằng suffix patterns (chạy nền)
      try {
        const candidates = generateRelatedForms(original);
        
        if (candidates.length === 0) {
          resolve();
          return;
        }

        // 3. Validate song song từng batch 5 từ (tránh quá tải API)
        const validatedWords = [];
        for (let i = 0; i < candidates.length; i += 5) {
          const batch = candidates.slice(i, i + 5);
          const results = await Promise.all(batch.map(w => validateAndTranslateWord(w)));
          validatedWords.push(...results);
          
          // Dừng sớm nếu đã tìm được 3+ từ hợp lệ
          const validCount = validatedWords.filter(w => w !== null).length;
          if (validCount >= 3) break;
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