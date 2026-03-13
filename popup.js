document.addEventListener('DOMContentLoaded', () => { loadVocab(); renderKnowledgePanel(); });
document.getElementById('clearBtn').addEventListener('click', clearVocab);
document.getElementById('knowledgeBtn').addEventListener('click', () => {
  document.getElementById('knowledgePanel').classList.toggle('show');
});

function loadVocab() {
  const container = document.getElementById('vocabContainer');
  container.innerHTML = '';

  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const list = result.vocabList;

    if (list.length === 0) {
      container.innerHTML = '<p>Chưa có từ nào được lưu.</p>';
      return;
    }

    // Nhóm từ liên quan theo từ gốc
    let i = 0;
    while (i < list.length) {
      const item = list[i];
      
      // Render từ chính
      const mainDiv = createWordElement(item, i);
      container.appendChild(mainDiv);
      
      // Thu thập các từ liên quan ngay sau từ chính
      const relatedItems = [];
      let j = i + 1;
      while (j < list.length && list[j].relatedTo && 
             list[j].relatedTo.toLowerCase() === item.original.toLowerCase()) {
        relatedItems.push({ item: list[j], index: j });
        j++;
      }
      
      // Nếu có từ liên quan → tạo group toggle
      if (relatedItems.length > 0) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-related';
        toggleBtn.innerHTML = `<span class="arrow">▶</span> ${relatedItems.length} từ liên quan`;
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'related-group collapsed';
        
        relatedItems.forEach(({ item: rItem, index: rIndex }) => {
          groupDiv.appendChild(createWordElement(rItem, rIndex));
        });
        
        toggleBtn.addEventListener('click', () => {
          groupDiv.classList.toggle('collapsed');
          toggleBtn.classList.toggle('expanded');
        });
        
        container.appendChild(toggleBtn);
        container.appendChild(groupDiv);
      }
      
      i = j;
    }

    // Sự kiện xóa
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        deleteWord(index);
      });
    });
  });
}

function createWordElement(item, index) {
  const div = document.createElement('div');
  div.className = 'word-item' + (item.relatedTo ? ' related-word' : '');
  
  let ipaHtml = item.ipa ? `<span class="ipa">${item.ipa}</span>` : '';
  let wordTypeHtml = item.wordType ? `<span class="word-type">${item.wordType}</span>` : '';
  let relatedBadge = item.relatedTo ? `<span class="related-badge">liên quan</span>` : '';
  let relatedToHtml = item.relatedTo ? `<div class="related-to-text">↳ từ gốc: ${item.relatedTo}</div>` : '';
  
  div.innerHTML = `
    <button class="delete-btn" data-index="${index}">×</button>
    <div class="original">${item.original} ${ipaHtml} ${relatedBadge}</div>
    ${wordTypeHtml}
    <div class="translated">${item.translated}</div>
    ${relatedToHtml}
    <div class="date">${item.date}</div>
  `;
  return div;
}

function deleteWord(index) {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const list = result.vocabList;
    list.splice(index, 1);
    chrome.storage.local.set({ vocabList: list }, () => {
      loadVocab();
    });
  });
}

function clearVocab() {
  if(confirm("Bạn có chắc muốn xóa hết từ vựng không?")) {
    chrome.storage.local.set({ vocabList: [] }, () => {
      loadVocab();
    });
  }
}

// Auto-refresh khi storage thay đổi (hiển thị từ liên quan khi được thêm ở background)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.vocabList) {
    loadVocab();
  }
});