document.addEventListener('DOMContentLoaded', loadVocab);
document.getElementById('clearBtn').addEventListener('click', clearVocab);

function loadVocab() {
  const container = document.getElementById('vocabContainer');
  container.innerHTML = ''; // Reset danh sách

  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const list = result.vocabList;

    if (list.length === 0) {
      container.innerHTML = '<p>Chưa có từ nào được lưu.</p>';
      return;
    }

    list.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'word-item';
      
      // Tạo HTML cho IPA và loại từ nếu có
      let ipaHtml = item.ipa ? `<span class="ipa">${item.ipa}</span>` : '';
      let wordTypeHtml = item.wordType ? `<span class="word-type">${item.wordType}</span>` : '';
      
      div.innerHTML = `
        <button class="delete-btn" data-index="${index}">×</button>
        <div class="original">${item.original} ${ipaHtml}</div>
        ${wordTypeHtml}
        <div class="translated">${item.translated}</div>
        <div class="date">${item.date}</div>
      `;
      container.appendChild(div);
    });

    // Thêm sự kiện xóa cho các nút
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        deleteWord(index);
      });
    });
  });
}

function deleteWord(index) {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const list = result.vocabList;
    list.splice(index, 1); // Xóa từ tại vị trí index
    chrome.storage.local.set({ vocabList: list }, () => {
      loadVocab(); // Tải lại danh sách
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