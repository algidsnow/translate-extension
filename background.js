// ===== LẮNG NGHE TIN NHẮN TỪ CONTENT.JS =====

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'TRANSLATE': {
          const data = await translateWithOllama(request.text);
          sendResponse({ success: true, data });
          break;
        }
        case 'SEARCH_WORDS': {
          const suggestions = await searchWordSuggestions(request.query);
          sendResponse({ success: true, suggestions });
          break;
        }
        case 'SAVE': {
          const saveResult = await saveWord(
            request.original, request.translated,
            request.ipa, request.wordType, request.example
          );
          sendResponse({ success: true, ...saveResult });
          break;
        }
        case 'GET_VOCAB': {
          const list = await getVocabList();
          sendResponse({ success: true, list });
          break;
        }
        case 'DELETE_WORD': {
          await deleteWord(request.id, request.index);
          sendResponse({ success: true });
          break;
        }
        case 'CLEAR_ALL': {
          await clearAllWords();
          sendResponse({ success: true });
          break;
        }
        default:
          sendResponse({ success: false, error: 'Unknown action: ' + request.action });
      }
    } catch (err) {
      console.error('[Background] Handler error for', request.action, ':', err);
      sendResponse({ success: false, error: err.message || String(err) });
    }
  })();

  return true; // Giữ message port mở cho async response
});

// ===== LẤY SETTINGS =====

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      {
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'gemma4:31b-cloud',
        supabaseUrl: '',
        supabaseAnonKey: ''
      },
      resolve
    );
  });
}

// ===== GỌI OLLAMA API =====

async function callOllama(prompt, settings, timeoutMs = 60000) {
  const baseUrl = (settings.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
  const model = settings.ollamaModel || 'gemma4:31b-cloud';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 512 }
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ollama lỗi ${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.response || '';
  } finally {
    clearTimeout(timer);
  }
}

// ===== PARSE JSON TỪ RESPONSE CỦA LLM =====

function parseJsonFromLLM(raw) {
  // Loại bỏ markdown code block nếu có
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  // Nếu '[' xuất hiện trước '{', đây là mảng
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
  } else if (firstBrace !== -1) {
    // Ngược lại là object
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
  }

  return JSON.parse(cleaned);
}

// ===== DỊCH BẰNG OLLAMA =====

async function translateWithOllama(text) {
  const settings = await getSettings();

  const prompt = `Bạn là từ điển Anh-Việt chuyên nghiệp. Phân tích từ/cụm từ tiếng Anh sau và trả về JSON theo đúng format (KHÔNG có markdown hay code block, chỉ JSON thuần):

{
  "translated": "nghĩa tiếng Việt ngắn gọn, chính xác nhất",
  "ipa": "phiên âm IPA, ví dụ /dɪˈveləp/",
  "wordType": "loại từ: noun / verb / adjective / adverb / phrase / ...",
  "example": "một câu ví dụ ngắn bằng tiếng Anh có dùng từ này"
}

Từ cần phân tích: "${text}"

Chỉ trả về JSON thuần, không có text nào khác.`;

  const raw = await callOllama(prompt, settings, 60000);

  try {
    const parsed = parseJsonFromLLM(raw);
    if (!parsed.translated) throw new Error('Missing translated field');
    return parsed;
  } catch (e) {
    console.error('[Background] Failed to parse Ollama response:', raw);
    throw new Error('Không thể parse kết quả từ Ollama. Thử lại hoặc kiểm tra model.');
  }
}

// ===== TÌM GỢI Ý TỪ VỰNG =====

async function searchWordSuggestions(query) {
  const settings = await getSettings();
  const cleanedQuery = String(query || '').trim();

  if (!cleanedQuery) return [];

  const prompt = `Bạn là từ điển Anh-Việt chuyên nghiệp. Người dùng đang tìm từ/cụm từ tiếng Anh: "${cleanedQuery}"

Hãy trả về đúng tối đa 3 gợi ý phù hợp nhất để học từ vựng. Ưu tiên:
- chính từ/cụm từ người dùng nhập nếu hợp lệ
- các biến thể phổ biến, word family, collocation hoặc cụm từ gần nghĩa
- không trả về từ quá hiếm hoặc không tự nhiên

Mỗi gợi ý cần đủ dữ liệu để lưu vào sổ từ vựng.
Chỉ trả về JSON array thuần, không markdown, không giải thích:
[
  {
    "original": "develop",
    "translated": "phát triển",
    "ipa": "/dɪˈveləp/",
    "wordType": "verb",
    "example": "They develop new software."
  }
]

Chỉ JSON array, không text khác.`;

  const raw = await callOllama(prompt, settings, 90000);

  try {
    const parsed = parseJsonFromLLM(raw);
    if (!Array.isArray(parsed)) throw new Error('Expected array');

    return parsed
      .map(item => ({
        original: String(item.original || item.word || '').trim(),
        translated: String(item.translated || '').trim(),
        ipa: String(item.ipa || '').trim(),
        wordType: String(item.wordType || item.word_type || '').trim(),
        example: String(item.example || '').trim()
      }))
      .filter(item => item.original && item.translated)
      .slice(0, 3);
  } catch (e) {
    console.error('[Background] Failed to parse search suggestions:', raw);
    throw new Error('Không thể parse gợi ý từ Ollama. Thử lại hoặc kiểm tra model.');
  }
}

// ===== LẤY WORD FAMILY BẰNG OLLAMA =====

async function getWordFamilyFromOllama(word, settings) {
  const prompt = `Liệt kê các từ trong "word family" (họ từ) của từ tiếng Anh: "${word}"

Bao gồm các dạng: noun, verb, adjective, adverb (nếu có). KHÔNG bao gồm từ gốc "${word}".
Chỉ trả về JSON array thuần (không markdown, không giải thích):
[{"word": "development", "wordType": "noun", "translated": "sự phát triển"}]

Chỉ từ thực sự tồn tại và phổ biến. Tối đa 5 từ. Chỉ JSON array, không text khác.`;

  try {
    const raw = await callOllama(prompt, settings, 90000);
    const parsed = parseJsonFromLLM(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Background] Word family parse error:', err.message);
    return [];
  }
}

// ===== SUPABASE REST API (có timeout) =====

async function supabaseRequest(settings, method, path, body = null) {
  const url = `${settings.supabaseUrl.replace(/\/$/, '')}/rest/v1${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': settings.supabaseAnonKey,
    'Authorization': `Bearer ${settings.supabaseAnonKey}`
  };

  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const opts = { method, headers, signal: controller.signal };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Supabase ${res.status}: ${errText.substring(0, 200)}`);
    }

    const text = await res.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

// ===== LƯU TỪ =====

async function saveWord(original, translated, ipa, wordType, example) {
  const settings = await getSettings();
  const today = new Date().toLocaleDateString('vi-VN');

  const wordData = {
    original: original.trim(),
    translated: translated || '',
    ipa: ipa || '',
    word_type: wordType || '',
    example: example || '',
    parentId: null,
    date: today
  };

  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    throw new Error('Chưa cấu hình Supabase URL hoặc Anon Key trong mục Cài đặt.');
  }

  // 1. Kiểm tra trùng lặp từ gốc hoặc từ trong word family
  try {
    const existing = await supabaseRequest(
      settings, 'GET',
      `/vocab_words?original=ilike.${encodeURIComponent(original.trim())}`
    );
    if (existing && existing.length > 0) {
      console.log('[Background] Word already exists:', original);
      return { supabaseSaved: false, isDuplicate: true };
    }
  } catch (err) {
    console.warn('[Background] Duplicate check failed:', err.message);
  }

  // 2. Lưu lên Supabase
  try {
    await supabaseRequest(settings, 'POST', '/vocab_words', wordData);
    console.log('[Background] Saved to Supabase:', original);
  } catch (err) {
    throw new Error(`Lỗi lưu Supabase: ${err.message}`);
  }

  // 3. Word family bằng Ollama (chạy nền)
  getWordFamilyAndSave(original, original, settings, today).catch(err => {
    console.warn('[Background] Word family background error:', err.message);
  });

  return { supabaseSaved: true, isDuplicate: false };
}

// LƯU LOCAL ĐƯỢC BỎ QUA VÌ YÊU CẦU CHỈ LƯU SUPABASE

// ===== LẤY VÀ LƯU WORD FAMILY =====

async function getWordFamilyAndSave(original, parentId, settings, today) {
  const familyWords = await getWordFamilyFromOllama(original, settings);
  if (!familyWords.length) {
    console.log('[Background] Ollama không trả về family words nào.');
    return;
  }

  // Lấy danh sách từ đã có trên Supabase để tránh trùng
  let existingWords = new Set();
  try {
    const list = await supabaseRequest(settings, 'GET', '/vocab_words?select=original');
    if (Array.isArray(list)) {
      existingWords = new Set(list.map(i => i.original?.toLowerCase()));
    }
  } catch (e) {
    console.warn('[Background] Không lấy được danh sách từ cũ để check trùng:', e.message);
  }

  for (const fw of familyWords) {
    if (!fw.word || existingWords.has(fw.word.toLowerCase())) continue;

    const relatedData = {
      original: fw.word,
      translated: fw.translated || '',
      ipa: '',
      word_type: fw.wordType || '',
      example: '',
      parentId: original, // Lưu chuỗi từ gốc làm parentId để dễ nhóm
      date: today
    };

    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      try {
        await supabaseRequest(settings, 'POST', '/vocab_words', relatedData);
        existingWords.add(fw.word.toLowerCase());
      } catch (err) {
        console.warn('[Background] Word family Supabase error:', err.message);
      }
    }
  }

  console.log(`[Background] Word family for "${original}" saved:`, familyWords.map(f => f.word));
}

// ===== LẤY DANH SÁCH TỪ =====

async function getVocabList() {
  const settings = await getSettings();

  if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
    throw new Error('Chưa cấu hình Supabase. Vui lòng vào cài đặt.');
  }

  try {
    const cloudList = await supabaseRequest(
      settings, 'GET',
      '/vocab_words?select=*&order=created_at.desc'
    );
    return Array.isArray(cloudList) ? cloudList : [];
  } catch (err) {
    throw new Error(`Lỗi tải từ Supabase: ${err.message}`);
  }
}

// ===== XÓA TỪ =====

async function deleteWord(id, index) {
  const settings = await getSettings();

  if (id && settings.supabaseUrl && settings.supabaseAnonKey) {
    try {
      await supabaseRequest(settings, 'DELETE', `/vocab_words?id=eq.${id}`);
    } catch (err) {
      throw new Error(`Lỗi xóa trên Supabase: ${err.message}`);
    }
  }
}

// ===== XÓA TẤT CẢ =====

async function clearAllWords() {
  const settings = await getSettings();

  if (settings.supabaseUrl && settings.supabaseAnonKey) {
    try {
      await supabaseRequest(settings, 'DELETE', '/vocab_words?created_at=gte.2000-01-01');
    } catch (err) {
      throw new Error(`Lỗi xóa toàn bộ trên Supabase: ${err.message}`);
    }
  }
}
