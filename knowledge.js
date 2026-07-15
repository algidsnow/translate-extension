// ===== DỮ LIỆU KIẾN THỨC NGỮ PHÁP =====

const TENSES_DATA = [
  {
    group: 'SIMPLE (Đơn)',
    tenses: [
      {
        name: 'Present Simple',
        color: 'tense-red',
        affirm: { formula: 'S + V(s/es)', example: 'She <b>works</b> every day.' },
        negative: { formula: 'S + do/does + not + V', example: 'He <b>doesn\'t like</b> coffee.' },
        question: { formula: 'Do/Does + S + V?', example: '<b>Does</b> she <b>work</b> here?' }
      },
      {
        name: 'Past Simple',
        color: 'tense-red',
        affirm: { formula: 'S + V-ed / V2', example: 'I <b>visited</b> Paris last year.' },
        negative: { formula: 'S + did + not + V', example: 'I <b>didn\'t visit</b> Paris.' },
        question: { formula: 'Did + S + V?', example: '<b>Did</b> you <b>visit</b> Paris?' }
      },
      {
        name: 'Future Simple',
        color: 'tense-red',
        affirm: { formula: 'S + will + V', example: 'They <b>will come</b> tomorrow.' },
        negative: { formula: 'S + will + not + V', example: 'They <b>won\'t come</b> tomorrow.' },
        question: { formula: 'Will + S + V?', example: '<b>Will</b> they <b>come</b>?' }
      }
    ]
  },
  {
    group: 'CONTINUOUS (Tiếp diễn)',
    tenses: [
      {
        name: 'Present Continuous',
        color: 'tense-green',
        affirm: { formula: 'S + am/is/are + V-ing', example: 'I <b>am studying</b> English.' },
        negative: { formula: 'S + am/is/are + not + V-ing', example: 'I <b>am not studying</b>.' },
        question: { formula: 'Am/Is/Are + S + V-ing?', example: '<b>Are</b> you <b>studying</b>?' }
      },
      {
        name: 'Past Continuous',
        color: 'tense-green',
        affirm: { formula: 'S + was/were + V-ing', example: 'She <b>was reading</b> when I called.' },
        negative: { formula: 'S + was/were + not + V-ing', example: 'She <b>wasn\'t reading</b>.' },
        question: { formula: 'Was/Were + S + V-ing?', example: '<b>Was</b> she <b>reading</b>?' }
      },
      {
        name: 'Future Continuous',
        color: 'tense-green',
        affirm: { formula: 'S + will be + V-ing', example: 'I <b>will be working</b> at 8pm.' },
        negative: { formula: 'S + will not be + V-ing', example: 'I <b>won\'t be working</b> at 8pm.' },
        question: { formula: 'Will + S + be + V-ing?', example: '<b>Will</b> you <b>be working</b>?' }
      }
    ]
  },
  {
    group: 'PERFECT (Hoàn thành)',
    tenses: [
      {
        name: 'Present Perfect',
        color: 'tense-blue',
        affirm: { formula: 'S + have/has + V3', example: 'I <b>have lived</b> here for 5 years.' },
        negative: { formula: 'S + have/has + not + V3', example: 'I <b>haven\'t lived</b> here long.' },
        question: { formula: 'Have/Has + S + V3?', example: '<b>Have</b> you <b>lived</b> here long?' }
      },
      {
        name: 'Past Perfect',
        color: 'tense-blue',
        affirm: { formula: 'S + had + V3', example: 'She <b>had left</b> before I arrived.' },
        negative: { formula: 'S + had + not + V3', example: 'She <b>hadn\'t left</b> yet.' },
        question: { formula: 'Had + S + V3?', example: '<b>Had</b> she <b>left</b>?' }
      },
      {
        name: 'Future Perfect',
        color: 'tense-blue',
        affirm: { formula: 'S + will have + V3', example: 'By 2025, I <b>will have graduated</b>.' },
        negative: { formula: 'S + will not have + V3', example: 'I <b>won\'t have finished</b> by then.' },
        question: { formula: 'Will + S + have + V3?', example: '<b>Will</b> you <b>have finished</b>?' }
      }
    ]
  },
  {
    group: 'PERFECT CONTINUOUS (Hoàn thành tiếp diễn)',
    tenses: [
      {
        name: 'Present Perfect Continuous',
        color: 'tense-purple',
        affirm: { formula: 'S + have/has been + V-ing', example: 'I <b>have been waiting</b> for 2 hours.' },
        negative: { formula: 'S + have/has not been + V-ing', example: 'I <b>haven\'t been waiting</b> long.' },
        question: { formula: 'Have/Has + S + been + V-ing?', example: '<b>Have</b> you <b>been waiting</b> long?' }
      },
      {
        name: 'Past Perfect Continuous',
        color: 'tense-purple',
        affirm: { formula: 'S + had been + V-ing', example: 'She <b>had been working</b> all day.' },
        negative: { formula: 'S + had not been + V-ing', example: 'She <b>hadn\'t been working</b>.' },
        question: { formula: 'Had + S + been + V-ing?', example: '<b>Had</b> she <b>been working</b>?' }
      },
      {
        name: 'Future Perfect Continuous',
        color: 'tense-purple',
        affirm: { formula: 'S + will have been + V-ing', example: 'By June, I <b>will have been studying</b> for a year.' },
        negative: { formula: 'S + will not have been + V-ing', example: 'I <b>won\'t have been studying</b> long.' },
        question: { formula: 'Will + S + have been + V-ing?', example: '<b>Will</b> you <b>have been studying</b>?' }
      }
    ]
  }
];

const WORD_TYPES_DATA = [
  {
    name: 'Noun (Danh từ)', icon: '🔵', color: 'noun',
    suffixes: ['-tion', '-sion', '-ment', '-ence', '-ance', '-ity', '-ness', '-er', '-or', '-ist'],
    rows: [
      { formula: 'N + V', example: '<b>Consistency</b> is important.' },
      { formula: 'V + N', example: 'I need <b>consistency</b>.' },
      { formula: 'prep + N', example: 'with <b>confidence</b>' },
      { formula: 'a/the + N', example: 'the <b>importance</b> of education' }
    ]
  },
  {
    name: 'Verb (Động từ)', icon: '🟢', color: 'verb',
    suffixes: ['-ate', '-ize', '-ise', '-ify', '-en'],
    rows: [
      { formula: 'S + V', example: 'He <b>creates</b> art.' },
      { formula: 'aux + V', example: 'She will <b>develop</b> a plan.' },
      { formula: 'to + V', example: 'I want to <b>improve</b>.' }
    ]
  },
  {
    name: 'Adjective (Tính từ)', icon: '🟡', color: 'adj',
    suffixes: ['-ent', '-ant', '-ive', '-ous', '-ful', '-able', '-ible', '-al', '-ic', '-y'],
    rows: [
      { formula: 'Adj + N', example: 'A <b>consistent</b> effort.' },
      { formula: 'be + Adj', example: 'She is <b>creative</b>.' },
      { formula: 'very + Adj', example: "It's very <b>important</b>." }
    ]
  },
  {
    name: 'Adverb (Trạng từ)', icon: '🟣', color: 'adv',
    suffixes: ['-ly', '-ically', '-ward', '-wise'],
    rows: [
      { formula: 'Adv + V', example: 'He <b>consistently</b> performs well.' },
      { formula: 'Adv + Adj', example: "It's <b>incredibly</b> important." },
      { formula: 'Adv, S+V', example: '<b>Importantly</b>, we must act now.' }
    ]
  }
];

const IPA_DATA = [
  {
    group: 'Nguyên âm đơn (Monophthongs)',
    rows: [
      { symbol: '/iː/', sound: 'i dài', example: 'sheep /ʃiːp/', pronounce: 'shiip' },
      { symbol: '/ɪ/', sound: 'i ngắn', example: 'ship /ʃɪp/', pronounce: 'ship' },
      { symbol: '/e/', sound: 'e', example: 'pen /pen/', pronounce: 'pen' },
      { symbol: '/æ/', sound: 'e bẹt', example: 'cat /kæt/', pronounce: 'két' },
      { symbol: '/ɑː/', sound: 'a dài', example: 'car /kɑːr/', pronounce: 'kaa' },
      { symbol: '/ɒ/', sound: 'o ngắn', example: 'hot /hɒt/', pronounce: 'hot' },
      { symbol: '/ɔː/', sound: 'o dài', example: 'door /dɔːr/', pronounce: 'đoo' },
      { symbol: '/ʊ/', sound: 'u ngắn', example: 'book /bʊk/', pronounce: 'buk' },
      { symbol: '/uː/', sound: 'u dài', example: 'food /fuːd/', pronounce: 'fuud' },
      { symbol: '/ʌ/', sound: 'â', example: 'cup /kʌp/', pronounce: 'kâp' },
      { symbol: '/ɜː/', sound: 'ơ dài', example: 'bird /bɜːrd/', pronounce: 'bơơd' },
      { symbol: '/ə/', sound: 'ơ nhẹ', example: 'about /əˈbaʊt/', pronounce: 'ơ-bao-t' }
    ]
  },
  {
    group: 'Nguyên âm đôi (Diphthongs)',
    rows: [
      { symbol: '/eɪ/', sound: 'ây', example: 'day /deɪ/', pronounce: 'đây' },
      { symbol: '/aɪ/', sound: 'ai', example: 'time /taɪm/', pronounce: 'tai-m' },
      { symbol: '/ɔɪ/', sound: 'oi', example: 'boy /bɔɪ/', pronounce: 'boi' },
      { symbol: '/əʊ/', sound: 'âu', example: 'go /ɡəʊ/', pronounce: 'gâu' },
      { symbol: '/aʊ/', sound: 'ao', example: 'now /naʊ/', pronounce: 'nao' },
      { symbol: '/ɪə/', sound: 'ia', example: 'near /nɪər/', pronounce: 'nia' },
      { symbol: '/eə/', sound: 'eə', example: 'hair /heər/', pronounce: 'heə' },
      { symbol: '/ʊə/', sound: 'ua', example: 'tour /tʊər/', pronounce: 'tua' }
    ]
  },
  {
    group: 'Phụ âm dễ nhầm',
    rows: [
      { symbol: '/θ/', sound: 'th vô thanh', example: 'think /θɪŋk/', pronounce: 'thing-k' },
      { symbol: '/ð/', sound: 'th hữu thanh', example: 'this /ðɪs/', pronounce: 'this' },
      { symbol: '/ʃ/', sound: 'sh', example: 'she /ʃiː/', pronounce: 'shii' },
      { symbol: '/ʒ/', sound: 'zh', example: 'vision /ˈvɪʒən/', pronounce: 'vi-zhơn' },
      { symbol: '/tʃ/', sound: 'ch', example: 'chair /tʃeər/', pronounce: 'cheə' },
      { symbol: '/dʒ/', sound: 'j', example: 'job /dʒɒb/', pronounce: 'job' },
      { symbol: '/ŋ/', sound: 'ng', example: 'sing /sɪŋ/', pronounce: 'sing' },
      { symbol: '/j/', sound: 'y', example: 'yes /jes/', pronounce: 'yes' }
    ]
  }
];

const IRREGULAR_VERBS_DATA = [
  { base: 'be', past: 'was/were', pp: 'been', ipa: '/biː/ - /wɒz, wɜːr/ - /biːn/', meaning: 'thì, là, ở' },
  { base: 'become', past: 'became', pp: 'become', ipa: '/bɪˈkʌm/ - /bɪˈkeɪm/ - /bɪˈkʌm/', meaning: 'trở thành' },
  { base: 'begin', past: 'began', pp: 'begun', ipa: '/bɪˈɡɪn/ - /bɪˈɡæn/ - /bɪˈɡʌn/', meaning: 'bắt đầu' },
  { base: 'break', past: 'broke', pp: 'broken', ipa: '/breɪk/ - /brəʊk/ - /ˈbrəʊkən/', meaning: 'làm vỡ' },
  { base: 'bring', past: 'brought', pp: 'brought', ipa: '/brɪŋ/ - /brɔːt/ - /brɔːt/', meaning: 'mang đến' },
  { base: 'build', past: 'built', pp: 'built', ipa: '/bɪld/ - /bɪlt/ - /bɪlt/', meaning: 'xây dựng' },
  { base: 'buy', past: 'bought', pp: 'bought', ipa: '/baɪ/ - /bɔːt/ - /bɔːt/', meaning: 'mua' },
  { base: 'catch', past: 'caught', pp: 'caught', ipa: '/kætʃ/ - /kɔːt/ - /kɔːt/', meaning: 'bắt, chụp' },
  { base: 'choose', past: 'chose', pp: 'chosen', ipa: '/tʃuːz/ - /tʃəʊz/ - /ˈtʃəʊzən/', meaning: 'chọn' },
  { base: 'come', past: 'came', pp: 'come', ipa: '/kʌm/ - /keɪm/ - /kʌm/', meaning: 'đến' },
  { base: 'cost', past: 'cost', pp: 'cost', ipa: '/kɒst/ - /kɒst/ - /kɒst/', meaning: 'có giá' },
  { base: 'cut', past: 'cut', pp: 'cut', ipa: '/kʌt/ - /kʌt/ - /kʌt/', meaning: 'cắt' },
  { base: 'do', past: 'did', pp: 'done', ipa: '/duː/ - /dɪd/ - /dʌn/', meaning: 'làm' },
  { base: 'draw', past: 'drew', pp: 'drawn', ipa: '/drɔː/ - /druː/ - /drɔːn/', meaning: 'vẽ, kéo' },
  { base: 'drink', past: 'drank', pp: 'drunk', ipa: '/drɪŋk/ - /dræŋk/ - /drʌŋk/', meaning: 'uống' },
  { base: 'drive', past: 'drove', pp: 'driven', ipa: '/draɪv/ - /drəʊv/ - /ˈdrɪvən/', meaning: 'lái xe' },
  { base: 'eat', past: 'ate', pp: 'eaten', ipa: '/iːt/ - /eɪt/ - /ˈiːtən/', meaning: 'ăn' },
  { base: 'fall', past: 'fell', pp: 'fallen', ipa: '/fɔːl/ - /fel/ - /ˈfɔːlən/', meaning: 'rơi, ngã' },
  { base: 'feel', past: 'felt', pp: 'felt', ipa: '/fiːl/ - /felt/ - /felt/', meaning: 'cảm thấy' },
  { base: 'find', past: 'found', pp: 'found', ipa: '/faɪnd/ - /faʊnd/ - /faʊnd/', meaning: 'tìm thấy' },
  { base: 'get', past: 'got', pp: 'got/gotten', ipa: '/ɡet/ - /ɡɒt/ - /ɡɒt, ˈɡɒtən/', meaning: 'nhận, trở nên' },
  { base: 'give', past: 'gave', pp: 'given', ipa: '/ɡɪv/ - /ɡeɪv/ - /ˈɡɪvən/', meaning: 'cho' },
  { base: 'go', past: 'went', pp: 'gone', ipa: '/ɡəʊ/ - /went/ - /ɡɒn/', meaning: 'đi' },
  { base: 'have', past: 'had', pp: 'had', ipa: '/hæv/ - /hæd/ - /hæd/', meaning: 'có' },
  { base: 'hear', past: 'heard', pp: 'heard', ipa: '/hɪər/ - /hɜːrd/ - /hɜːrd/', meaning: 'nghe' },
  { base: 'hold', past: 'held', pp: 'held', ipa: '/həʊld/ - /held/ - /held/', meaning: 'cầm, giữ' },
  { base: 'keep', past: 'kept', pp: 'kept', ipa: '/kiːp/ - /kept/ - /kept/', meaning: 'giữ' },
  { base: 'know', past: 'knew', pp: 'known', ipa: '/nəʊ/ - /njuː/ - /nəʊn/', meaning: 'biết' },
  { base: 'leave', past: 'left', pp: 'left', ipa: '/liːv/ - /left/ - /left/', meaning: 'rời đi' },
  { base: 'lose', past: 'lost', pp: 'lost', ipa: '/luːz/ - /lɒst/ - /lɒst/', meaning: 'mất, thua' },
  { base: 'make', past: 'made', pp: 'made', ipa: '/meɪk/ - /meɪd/ - /meɪd/', meaning: 'làm, tạo' },
  { base: 'meet', past: 'met', pp: 'met', ipa: '/miːt/ - /met/ - /met/', meaning: 'gặp' },
  { base: 'pay', past: 'paid', pp: 'paid', ipa: '/peɪ/ - /peɪd/ - /peɪd/', meaning: 'trả tiền' },
  { base: 'put', past: 'put', pp: 'put', ipa: '/pʊt/ - /pʊt/ - /pʊt/', meaning: 'đặt, để' },
  { base: 'read', past: 'read', pp: 'read', ipa: '/riːd/ - /red/ - /red/', meaning: 'đọc' },
  { base: 'run', past: 'ran', pp: 'run', ipa: '/rʌn/ - /ræn/ - /rʌn/', meaning: 'chạy' },
  { base: 'say', past: 'said', pp: 'said', ipa: '/seɪ/ - /sed/ - /sed/', meaning: 'nói' },
  { base: 'see', past: 'saw', pp: 'seen', ipa: '/siː/ - /sɔː/ - /siːn/', meaning: 'nhìn thấy' },
  { base: 'sell', past: 'sold', pp: 'sold', ipa: '/sel/ - /səʊld/ - /səʊld/', meaning: 'bán' },
  { base: 'send', past: 'sent', pp: 'sent', ipa: '/send/ - /sent/ - /sent/', meaning: 'gửi' },
  { base: 'sit', past: 'sat', pp: 'sat', ipa: '/sɪt/ - /sæt/ - /sæt/', meaning: 'ngồi' },
  { base: 'speak', past: 'spoke', pp: 'spoken', ipa: '/spiːk/ - /spəʊk/ - /ˈspəʊkən/', meaning: 'nói' },
  { base: 'spend', past: 'spent', pp: 'spent', ipa: '/spend/ - /spent/ - /spent/', meaning: 'tiêu, dành' },
  { base: 'stand', past: 'stood', pp: 'stood', ipa: '/stænd/ - /stʊd/ - /stʊd/', meaning: 'đứng' },
  { base: 'take', past: 'took', pp: 'taken', ipa: '/teɪk/ - /tʊk/ - /ˈteɪkən/', meaning: 'lấy, mang' },
  { base: 'teach', past: 'taught', pp: 'taught', ipa: '/tiːtʃ/ - /tɔːt/ - /tɔːt/', meaning: 'dạy' },
  { base: 'tell', past: 'told', pp: 'told', ipa: '/tel/ - /təʊld/ - /təʊld/', meaning: 'kể, bảo' },
  { base: 'think', past: 'thought', pp: 'thought', ipa: '/θɪŋk/ - /θɔːt/ - /θɔːt/', meaning: 'nghĩ' },
  { base: 'understand', past: 'understood', pp: 'understood', ipa: '/ˌʌndəˈstænd/ - /ˌʌndəˈstʊd/ - /ˌʌndəˈstʊd/', meaning: 'hiểu' },
  { base: 'write', past: 'wrote', pp: 'written', ipa: '/raɪt/ - /rəʊt/ - /ˈrɪtən/', meaning: 'viết' }
];

// ===== RENDER FUNCTIONS =====

function renderKnowledgePanel() {
  const panel = document.getElementById('knowledgePanel');
  if (!panel) return;

  panel.innerHTML = `
    ${renderTensesTopic()}
    ${renderWordTypeTopic()}
    ${renderIpaTopic()}
    ${renderIrregularVerbsTopic()}
  `;

  // Thêm event listeners để tránh vi phạm Chrome Extension CSP (không dùng inline onclick)
  panel.querySelectorAll('.k-topic-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });

  panel.querySelectorAll('.k-speak-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = e.currentTarget.dataset.word;
      if (word && typeof speakWord === 'function') speakWord(word);
    });
  });
}

function renderSpeakButton(text) {
  return `<button class="k-speak-btn" data-word="${text}" title="Đọc phát âm">🔊</button>`;
}

function renderVerbForm(text) {
  const speechText = text.replace(/\//g, ' ');
  return `<span class="k-word-with-audio"><span>${text}</span>${renderSpeakButton(speechText)}</span>`;
}

function renderIpaTopic() {
  const ipaHtml = IPA_DATA.map(group => `
    <div class="k-section tense-blue">
      <div class="k-title">${group.group}</div>
      <div class="k-table-wrap">
        <table class="k-table">
          <thead>
            <tr>
              <th>Ký hiệu</th>
              <th>Cách nhớ</th>
              <th>Ví dụ</th>
              <th>Phát âm</th>
            </tr>
          </thead>
          <tbody>
            ${group.rows.map(row => `
              <tr>
                <td><span class="k-ipa-symbol">${row.symbol}</span></td>
                <td>${row.sound}</td>
                <td><span class="k-word-with-audio"><span class="k-example">${row.example}</span>${renderSpeakButton(row.example.split(' ')[0])}</span></td>
                <td>${row.pronounce}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('');

  return `
    <div class="k-topic">
      <div class="k-topic-header">
        <span>🔊 Bảng IPA cơ bản</span>
        <span class="k-arrow">▶</span>
      </div>
      <div class="k-topic-body">${ipaHtml}</div>
    </div>
  `;
}

function renderIrregularVerbsTopic() {
  return `
    <div class="k-topic">
      <div class="k-topic-header">
        <span>🧩 Động từ bất quy tắc thường dùng</span>
        <span class="k-arrow">▶</span>
      </div>
      <div class="k-topic-body">
        <div class="k-section verb">
          <div class="k-table-wrap">
            <table class="k-table">
              <thead>
                <tr>
                  <th>V1</th>
                  <th>V2</th>
                  <th>V3</th>
                  <th>Nghĩa</th>
                </tr>
              </thead>
              <tbody>
                ${IRREGULAR_VERBS_DATA.map(verb => `
                  <tr>
                    <td><span class="k-formula">${renderVerbForm(verb.base)}</span></td>
                    <td>${renderVerbForm(verb.past)}</td>
                    <td>${renderVerbForm(verb.pp)}</td>
                    <td>${verb.meaning}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTensesTopic() {
  const tensesHtml = TENSES_DATA.map(group => `
    <div class="k-divider">— ${group.group} —</div>
    ${group.tenses.map(t => `
      <div class="k-section ${t.color}">
        <div class="k-title">${t.name}</div>
        <div class="k-row"><span class="k-label">✅</span> <span class="k-formula">${t.affirm.formula}</span></div>
        <div class="k-row k-ex">${t.affirm.example}</div>
        <div class="k-row"><span class="k-label">❌</span> <span class="k-formula">${t.negative.formula}</span></div>
        <div class="k-row k-ex">${t.negative.example}</div>
        <div class="k-row"><span class="k-label">❓</span> <span class="k-formula">${t.question.formula}</span></div>
        <div class="k-row k-ex">${t.question.example}</div>
      </div>
    `).join('')}
  `).join('');

  return `
    <div class="k-topic">
      <div class="k-topic-header">
        <span>⏰ Các thì thường dùng</span>
        <span class="k-arrow">▶</span>
      </div>
      <div class="k-topic-body">${tensesHtml}</div>
    </div>
  `;
}

function renderWordTypeTopic() {
  const typesHtml = WORD_TYPES_DATA.map(wt => `
    <div class="k-section ${wt.color}">
      <div class="k-title"><span class="k-icon">${wt.icon}</span>${wt.name}</div>
      <div class="k-row" style="margin-bottom: 6px;">
        <span class="k-label" style="font-weight: bold; color: #555;">Dấu hiệu:</span> 
        ${wt.suffixes.map(s => `<span class="k-formula" style="color:#1976d2; background:#e3f2fd; border:1px solid #bbdefb">${s}</span>`).join(' ')}
      </div>
      <div class="k-divider">— Vị trí trong câu —</div>
      ${wt.rows.map(r => `
        <div class="k-row"><span class="k-formula">${r.formula}</span> — <span class="k-example">${r.example}</span></div>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="k-topic">
      <div class="k-topic-header">
        <span>📍 Vị trí & Dấu hiệu từ loại</span>
        <span class="k-arrow">▶</span>
      </div>
      <div class="k-topic-body">${typesHtml}</div>
    </div>
  `;
}
