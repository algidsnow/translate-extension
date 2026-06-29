// ===== KHỞI TẠO =====

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
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

  const ipaHtml = item.ipa ? `<span class="ipa">${item.ipa}</span>` : '';
  const badgeHtml = item.parentId ? `<span class="related-badge">word family</span>` : '';
  const typeHtml = item.wordType ? `<span class="word-type">${item.wordType}</span>` : '';
  const exHtml = item.example ? `<div class="example-text">${item.example}</div>` : '';
  const relatedToHtml = item.parentId ? `<div class="related-to-text">↳ từ gốc: <b>${item.parentId}</b></div>` : '';
  const itemId = origItem?.id || '';

  div.innerHTML = `
    <div class="word-actions">
      <button class="tts-word-btn" data-word="${item.original}" title="Đọc từ">🔊</button>
      <button class="delete-btn" data-index="${index}" data-id="${itemId}" title="Xóa">×</button>
    </div>
    <div class="word-main-row">
      <span class="original">${item.original}</span>
      ${ipaHtml}
      ${badgeHtml}
    </div>
    ${typeHtml}
    <div class="translated">${item.translated}</div>
    ${exHtml}
    ${relatedToHtml}
    <div class="date">${item.date}</div>
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
    loadVocab();
  });
}

// ===== XÓA TẤT CẢ =====

function clearVocab() {
  if (confirm('Bạn có chắc muốn xóa tất cả từ vựng không?')) {
    chrome.runtime.sendMessage({ action: 'CLEAR_ALL' }, () => {
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