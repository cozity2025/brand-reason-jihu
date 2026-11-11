// 브랜드의 이유 RAG 챗봇 위젯: 오른쪽 아래 버튼 → 대화창 → POST /api/chat
// 주소 끝에 #chat 을 붙이면 페이지가 열릴 때 대화창도 바로 열려요.
(function () {
  const css = `
  .br-chat-btn{position:fixed;right:22px;bottom:22px;z-index:50;border:0;border-radius:999px;background:#3182f6;color:#fff;font:700 15px -apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;padding:15px 20px;box-shadow:0 10px 30px #1b64da40;cursor:pointer;display:flex;align-items:center;gap:8px}
  .br-chat-btn:hover{background:#1b64da}
  .br-chat{position:fixed;right:22px;bottom:22px;z-index:51;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 44px);background:#fff;border-radius:24px;box-shadow:0 24px 80px #191f2833;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;color:#191f28;word-break:keep-all}
  .br-chat.open{display:flex}
  .br-chat header{padding:18px 20px;background:#3182f6;color:#fff;display:flex;justify-content:space-between;align-items:flex-start}
  .br-chat header b{font-size:17px;display:block}.br-chat header small{opacity:.85;font-size:12.5px}
  .br-chat header button{background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 2px}
  .br-log{flex:1;overflow-y:auto;padding:18px 16px;background:#f7f9fc;display:flex;flex-direction:column;gap:10px}
  .br-msg{max-width:86%;padding:11px 14px;border-radius:16px;font-size:14.5px;line-height:1.65;white-space:pre-wrap}
  .br-msg.bot{background:#fff;align-self:flex-start;border-top-left-radius:6px;box-shadow:0 1px 3px #0000000d}
  .br-msg.me{background:#3182f6;color:#fff;align-self:flex-end;border-top-right-radius:6px}
  .br-msg.err{background:#fff0f0;color:#d22030}
  .br-src{margin-top:8px;padding-top:8px;border-top:1px solid #eef0f3;font-size:12px;color:#8b95a1;line-height:1.6}
  .br-chips{display:flex;flex-wrap:wrap;gap:6px}
  .br-chips button{border:1px solid #d6e6ff;background:#fff;color:#1b64da;border-radius:999px;padding:7px 11px;font-size:13px;cursor:pointer;font-family:inherit}
  .br-chips button:hover{background:#e8f3ff}
  .br-form{display:flex;gap:8px;padding:12px;border-top:1px solid #eef0f3;background:#fff}
  .br-form textarea{flex:1;resize:none;border:1px solid #e5e8eb;border-radius:14px;padding:11px 13px;font:15px inherit;font-family:inherit;height:46px;max-height:110px;outline:none}
  .br-form textarea:focus{border-color:#3182f6}
  .br-form button{border:0;border-radius:14px;background:#3182f6;color:#fff;font-weight:700;font-size:15px;padding:0 16px;cursor:pointer;font-family:inherit}
  .br-form button:disabled{background:#b3d5ff;cursor:default}
  .br-note{font-size:11.5px;color:#8b95a1;text-align:center;padding:0 12px 10px;background:#fff}
  .br-dots span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#b0b8c1;animation:brdot 1s infinite}
  .br-dots span:nth-child(2){animation-delay:.15s}.br-dots span:nth-child(3){animation-delay:.3s}
  @keyframes brdot{0%,80%,100%{opacity:.3}40%{opacity:1}}
  @media(max-width:480px){.br-chat{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}}`;

  const SUGGEST = ['사입 상품은 어떻게 차별화해요?', '수납함 상세페이지 문구 예시 보여 주세요', '멤버십 요금제 차이가 뭐예요?', '가이드에는 뭐가 들어 있어요?'];
  const LABEL = { lecture: '강의', product: '상품', membership: '멤버십', curriculum: '커리큘럼', example: '문구 예시', 'business-model': '브랜드 소개' };

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'br-chat-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '브랜드의 이유 챗봇 열기');
  btn.innerHTML = '<span aria-hidden="true">💬</span> 무엇이든 물어보세요';

  const box = document.createElement('section');
  box.className = 'br-chat';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', '브랜드의 이유 챗봇');
  box.innerHTML = `
    <header><div><b>브랜드의 이유 챗봇</b><small>강의 원문과 사이트 정보를 찾아 답해요</small></div><button type="button" aria-label="닫기">×</button></header>
    <div class="br-log" aria-live="polite"></div>
    <form class="br-form"><textarea rows="1" maxlength="500" placeholder="예: 빨래 바구니 문구를 어떻게 바꿀까요?" aria-label="질문"></textarea><button type="submit">보내기</button></form>
    <div class="br-note">AI 답변은 틀릴 수 있어요 · 과제용 데모라 실제 결제는 없어요</div>`;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  const log = box.querySelector('.br-log');
  const form = box.querySelector('form');
  const input = form.querySelector('textarea');
  const send = form.querySelector('button');
  const history = [];
  let busy = false;

  function bubble(text, who) {
    const el = document.createElement('div');
    el.className = `br-msg ${who}`;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function greet() {
    bubble('안녕하세요! 「브랜드의 이유」 챗봇이에요.\n사입 상품 차별화, 상세페이지 문구, 가이드·멤버십에 대해 물어보세요.', 'bot');
    const chips = document.createElement('div');
    chips.className = 'br-chips';
    SUGGEST.forEach((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.onclick = () => { chips.remove(); ask(q); };
      chips.appendChild(b);
    });
    log.appendChild(chips);
  }

  async function ask(text) {
    if (busy || !text.trim()) return;
    busy = true; send.disabled = true;
    bubble(text, 'me');
    const wait = bubble('', 'bot');
    wait.innerHTML = '<span class="br-dots"><span></span><span></span><span></span></span>';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '답변을 받지 못했어요.');
      wait.textContent = data.answer.replace(/\*\*(.+?)\*\*/g, '$1');
      if (data.sources && data.sources.length) {
        const src = document.createElement('div');
        src.className = 'br-src';
        src.textContent = '참고한 자료 · ' + data.sources.slice(0, 3).map((s) => `${LABEL[s.source] || s.source}: ${s.title}`).join(' / ');
        wait.appendChild(src);
      }
      history.push({ role: 'user', content: text }, { role: 'assistant', content: data.answer });
      if (typeof gtag === 'function') gtag('event', 'chatbot_question');
    } catch (err) {
      wait.className = 'br-msg err';
      wait.textContent = err.message;
    } finally {
      busy = false; send.disabled = false;
      log.scrollTop = log.scrollHeight;
      input.focus();
    }
  }

  function open() {
    box.classList.add('open');
    btn.style.display = 'none';
    if (!log.childElementCount) greet();
    input.focus();
  }
  function close() {
    box.classList.remove('open');
    btn.style.display = '';
  }

  btn.onclick = open;
  box.querySelector('header button').onclick = close;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
  form.onsubmit = (e) => { e.preventDefault(); const t = input.value; input.value = ''; ask(t); };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  if (location.hash === '#chat') open();
})();
