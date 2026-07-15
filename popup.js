// ===== KHỞI TẠO =====

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSearch();
  loadSettings();
  loadVocab();
  renderKnowledgePanel();
});

// ===== TABS =====

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('vocabView').style.display = tab === 'vocab' ? 'block' : 'none';
      document.getElementById('settingsView').style.display = tab === 'settings' ? 'block' : 'none';
      document.getElementById('knowledgePanel').style.display = tab === 'vocab' ? '' : 'none';
    });
  });

  // Header buttons
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.querySelector('[data-tab="settings"]').click();
  });
  document.getElementById('knowledgeBtn').addEventListener('click', () => {
    document.querySelector('[data-tab="vocab"]').click();
    document.getElementById('knowledgePanel').classList.toggle('show');
  });
  document.getElementById('clearBtn').addEventListener('click', clearVocab);
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
}

// ===== SEARCH =====

function initSearch() {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');

  btn.addEventListener('click', runSearch);
  input.addEventListener('input', () => {
    if (!input.value.trim()) clearSearchResults();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runSearch();
    if (e.key === 'Escape') clearSearchResults({ clearInput: true });
  });
}

function runSearch() {
  const input = document.getElementById('searchInput');
  const query = input.value.trim();

  if (!query) {
    renderSearchStatus('Nhập từ hoặc cụm từ tiếng Anh để tìm gợi ý.');
    input.focus();
    return;
  }

  setSearchLoading(true);
  renderSearchStatus('Đang tìm gợi ý...');

  chrome.runtime.sendMessage({ action: 'SEARCH_WORDS', query }, (response) => {
    setSearchLoading(false);

    if (chrome.runtime.lastError) {
      renderSearchStatus(`Lỗi kết nối: ${chrome.runtime.lastError.message}`, true);
      return;
    }

    if (!response || !response.success) {
      renderSearchStatus(response?.error || 'Không tìm được gợi ý.', true);
      return;
    }

    renderSearchSuggestions(response.suggestions || []);
  });
}

function setSearchLoading(isLoading) {
  const btn = document.getElementById('searchBtn');
  const input = document.getElementById('searchInput');
  btn.disabled = isLoading;
  input.disabled = isLoading;
  btn.textContent = isLoading ? '…' : '🔎';
}

function renderSearchStatus(message, isError = false) {
  const results = document.getElementById('searchResults');
  results.classList.add('show');
  results.innerHTML = `<div class="search-status" style="${isError ? 'color:#f87171;' : ''}">${escapeHtml(message)}</div>`;
}

function renderSearchSuggestions(suggestions) {
  const results = document.getElementById('searchResults');
  results.classList.add('show');

  if (!suggestions.length) {
    renderSearchStatus('Không có gợi ý phù hợp.');
    return;
  }

  results.innerHTML = suggestions.map((item, index) => {
    const original = item.original || item.word || '';
    const ipaHtml = item.ipa ? `<span class="ipa">${escapeHtml(item.ipa)}</span>` : '';
    const typeHtml = item.wordType ? `<span class="word-type">${escapeHtml(item.wordType)}</span>` : '';
    const exampleHtml = item.example ? `<div class="example-text">${escapeHtml(item.example)}</div>` : '';

    return `
      <div class="suggestion-item">
        <button class="suggestion-add-btn" data-index="${index}">Thêm</button>
        <div class="suggestion-main-row">
          <span class="suggestion-word">${escapeHtml(original)}</span>
          ${ipaHtml}
        </div>
        ${typeHtml}
        <div class="translated">${escapeHtml(item.translated || '')}</div>
        ${exampleHtml}
      </div>
    `;
  }).join('');

  results.querySelectorAll('.suggestion-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = suggestions[parseInt(btn.dataset.index, 10)];
      saveSuggestion(item, btn);
    });
  });
}

function clearSearchResults({ clearInput = false } = {}) {
  const results = document.getElementById('searchResults');
  const input = document.getElementById('searchInput');

  results.classList.remove('show');
  results.innerHTML = '';
  if (clearInput) input.value = '';
}

function saveSuggestion(item, btn) {
  const original = (item.original || item.word || '').trim();
  if (!original) return;

  btn.textContent = 'Đang lưu';
  btn.disabled = true;

  chrome.runtime.sendMessage({
    action: 'SAVE',
    original,
    translated: item.translated || '',
    ipa: item.ipa || '',
    wordType: item.wordType || '',
    example: item.example || ''
  }, (response) => {
    if (chrome.runtime.lastError) {
      btn.textContent = 'Lỗi';
      btn.style.background = '#7f1d1d';
      btn.style.color = '#fecaca';
      btn.disabled = false;
      return;
    }

    if (response && response.success) {
      if (response.isDuplicate) {
        btn.textContent = 'Đã có';
        btn.style.background = '#78350f';
        btn.style.color = '#fcd34d';
      } else {
        btn.textContent = 'Đã thêm';
        btn.style.background = '#14532d';
        btn.style.color = '#bbf7d0';
      }
      clearSearchResults({ clearInput: true });
      loadVocab();
      return;
    }

    btn.textContent = 'Lỗi';
    btn.style.background = '#7f1d1d';
    btn.style.color = '#fecaca';
    btn.disabled = false;
    if (response?.error) alert(`Thất bại:\n\n${response.error}`);
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== SETTINGS =====

function loadSettings() {
  chrome.storage.local.get(
    { ollamaUrl: 'http://localhost:11434', ollamaModel: 'gemma4:31b-cloud', supabaseUrl: '', supabaseAnonKey: '' },
    (s) => {
      document.getElementById('ollamaUrlInput').value = s.ollamaUrl || 'http://localhost:11434';
      document.getElementById('ollamaModelInput').value = s.ollamaModel || 'gemma4:31b-cloud';
      if (s.supabaseUrl) document.getElementById('supabaseUrlInput').value = s.supabaseUrl;
      if (s.supabaseAnonKey) document.getElementById('supabaseKeyInput').value = s.supabaseAnonKey;
    }
  );
}

function saveSettings() {
  const ollamaUrl = document.getElementById('ollamaUrlInput').value.trim() || 'http://localhost:11434';
  const ollamaModel = document.getElementById('ollamaModelInput').value.trim() || 'gemma4:31b-cloud';
  const supabaseUrl = document.getElementById('supabaseUrlInput').value.trim();
  const supabaseAnonKey = document.getElementById('supabaseKeyInput').value.trim();

  chrome.storage.local.set({ ollamaUrl, ollamaModel, supabaseUrl, supabaseAnonKey }, () => {
    const msg = document.getElementById('savedMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2500);
    setTimeout(() => {
      document.querySelector('[data-tab="vocab"]').click();
      loadVocab();
    }, 800);
  });
}

// ===== LOAD VOCAB =====

function loadVocab() {
  const container = document.getElementById('vocabContainer');
  container.innerHTML = `
    <div class="loading-state">
      <div class="mini-spinner"></div>
      <div>Đang tải từ vựng...</div>
    </div>
  `;

  // Kiểm tra Ollama URL đã được cấu hình chưa (mặc định vẫn OK)
  chrome.runtime.sendMessage({ action: 'GET_VOCAB' }, (response) => {
    if (chrome.runtime.lastError) {
      container.innerHTML = `<div class="loading-state" style="color:#f87171;">Lỗi: ${chrome.runtime.lastError.message}</div>`;
      return;
    }

    const list = (response && response.success && response.list) ? response.list : [];
    renderVocabList(list);
  });
}

function renderVocabList(list) {
  const container = document.getElementById('vocabContainer');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Chưa có từ nào được lưu.<br>Bôi đen từ trên trang web để bắt đầu!</p>
      </div>
    `;
    return;
  }

  const normalize = (item) => ({
    id: item.id,
    original: item.original,
    translated: item.translated,
    ipa: item.ipa || '',
    wordType: item.word_type || item.wordType || '',
    example: item.example || '',
    parentId: item.parentId || item.parent_id || null,
    date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '')
  });

  const normalized = list.map(normalize);

  // Tách từ chính và từ con
  const parentWords = [];
  const childWords = [];

  normalized.forEach((item, idx) => {
    const data = { item, origItem: list[idx], index: idx };
    if (item.parentId) {
      childWords.push(data);
    } else {
      parentWords.push(data);
    }
  });

  // Render từng từ chính và tìm các từ con tương ứng
  parentWords.forEach(({ item, origItem, index }) => {
    const mainDiv = createWordElement(item, index, origItem);
    container.appendChild(mainDiv);

    const relatedItems = childWords.filter(
      x => x.item.parentId.toLowerCase() === item.original.toLowerCase()
    );

    if (relatedItems.length > 0) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'toggle-related';
      toggleBtn.innerHTML = `<span class="arrow">▶</span> ${relatedItems.length} từ trong word family`;

      const groupDiv = document.createElement('div');
      groupDiv.className = 'related-group collapsed';

      relatedItems.forEach(r => {
        groupDiv.appendChild(createWordElement(r.item, r.index, r.origItem));
      });

      toggleBtn.addEventListener('click', () => {
        groupDiv.classList.toggle('collapsed');
        toggleBtn.classList.toggle('expanded');
      });

      container.appendChild(toggleBtn);
      container.appendChild(groupDiv);
    }
  });

  // Bind delete events
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index);
      const id = e.currentTarget.dataset.id;
      deleteWord(id, index);
    });
  });

  // Bind TTS events
  container.querySelectorAll('.tts-word-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = e.currentTarget.dataset.word;
      speakWord(word);
    });
  });
}

// ===== TẠO ELEMENT TỪ =====

function createWordElement(item, index, origItem) {
  const div = document.createElement('div');
  div.className = 'word-item' + (item.parentId ? ' related-word' : '');

  const ipaHtml = item.ipa ? `<span class="ipa">${escapeHtml(item.ipa)}</span>` : '';
  const badgeHtml = item.parentId ? `<span class="related-badge">word family</span>` : '';
  const typeHtml = item.wordType ? `<span class="word-type">${escapeHtml(item.wordType)}</span>` : '';
  const exHtml = item.example ? `<div class="example-text">${escapeHtml(item.example)}</div>` : '';
  const relatedToHtml = item.parentId ? `<div class="related-to-text">↳ từ gốc: <b>${escapeHtml(item.parentId)}</b></div>` : '';
  const itemId = escapeHtml(origItem?.id || '');
  const original = escapeHtml(item.original);

  div.innerHTML = `
    <div class="word-actions">
      <button class="tts-word-btn" data-word="${original}" title="Đọc từ">🔊</button>
      <button class="delete-btn" data-index="${index}" data-id="${itemId}" title="Xóa">×</button>
    </div>
    <div class="word-main-row">
      <span class="original">${original}</span>
      ${ipaHtml}
      ${badgeHtml}
    </div>
    ${typeHtml}
    <div class="translated">${escapeHtml(item.translated)}</div>
    ${exHtml}
    ${relatedToHtml}
    <div class="date">${escapeHtml(item.date)}</div>
  `;
  return div;
}

// ===== TEXT TO SPEECH =====

function speakWord(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// ===== XÓA TỪ =====

function deleteWord(id, index) {
  chrome.runtime.sendMessage({ action: 'DELETE_WORD', id, index }, () => {
    clearSearchResults({ clearInput: true });
    loadVocab();
  });
}

// ===== XÓA TẤT CẢ =====

function clearVocab() {
  if (confirm('Bạn có chắc muốn xóa tất cả từ vựng không?')) {
    chrome.runtime.sendMessage({ action: 'CLEAR_ALL' }, () => {
      clearSearchResults({ clearInput: true });
      loadVocab();
    });
  }
}

// ===== AUTO-REFRESH KHI STORAGE THAY ĐỔI =====

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.vocabList) {
    loadVocab();
  }
});
