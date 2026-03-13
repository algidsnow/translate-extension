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

// ===== RENDER FUNCTIONS =====

function renderKnowledgePanel() {
  const panel = document.getElementById('knowledgePanel');
  if (!panel) return;

  panel.innerHTML = `
    ${renderTensesTopic()}
    ${renderWordTypeTopic()}
  `;

  // Thêm event listeners để tránh vi phạm Chrome Extension CSP (không dùng inline onclick)
  panel.querySelectorAll('.k-topic-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });
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
