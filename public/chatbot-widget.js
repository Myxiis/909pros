(function () {
  // ---- 1. INJECT STYLES ----
  const style = document.createElement('style');
  style.textContent = `
    #chat-bubble {
      position: fixed; bottom: 20px; right: 20px;
      width: 60px; height: 60px; border-radius: 50%;
      background: #2563eb; color: #fff; display:flex;
      align-items:center; justify-content:center;
      font-size: 26px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2);
      z-index: 999999; font-family: 'Segoe UI', Arial, sans-serif;
    }
    #chat-window {
      position: fixed; bottom: 90px; right: 20px;
      width: 320px; max-height: 460px; background: #fff;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.2);
      display: none; flex-direction: column; overflow: hidden;
      z-index: 999999; font-family: 'Segoe UI', Arial, sans-serif;
    }
    #chat-header {
      background: #2563eb; color:#fff; padding: 14px;
      font-weight: 600; display:flex; justify-content:space-between; align-items:center;
    }
    #chat-header span#close-btn { cursor:pointer; font-size:18px; }
    #chat-body {
      flex: 1; padding: 14px; overflow-y: auto;
      display:flex; flex-direction:column; gap:10px; font-size: 14px;
      max-height: 320px;
    }
    .bot-msg, .user-msg {
      padding: 8px 12px; border-radius: 10px; max-width: 80%;
      line-height: 1.4;
    }
    .bot-msg { background:#f1f5f9; align-self:flex-start; color:#111; }
    .user-msg { background:#2563eb; color:#fff; align-self:flex-end; }
    #chat-input-area { display:flex; border-top: 1px solid #e5e7eb; padding: 8px; }
    #chat-input { flex:1; border:none; outline:none; padding: 8px; font-size:14px; }
    #chat-send {
      background:#2563eb; color:#fff; border:none; padding: 8px 14px;
      border-radius: 8px; cursor:pointer; margin-left:6px;
    }
    #success-msg { display:none; padding:14px; text-align:center; color:#16a34a; font-weight:600; }
  `;
  document.head.appendChild(style);

  // ---- 2. INJECT MARKUP ----
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="chat-bubble">💬</div>
    <div id="chat-window">
      <div id="chat-header">
        <span>Chat with us</span>
        <span id="close-btn">✕</span>
      </div>
      <div id="chat-body"></div>
      <div id="success-msg">✅ Thanks! We'll be in touch shortly.</div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="Type your answer..." />
        <button id="chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ---- 3. BOT LOGIC ----
  const steps = [
    { key: "name",     bot: "Hi! 👋 Thanks for stopping by. What's your name?" },
    { key: "email",    bot: (data) => `Nice to meet you, ${data.name}! What's the best email to reach you?` },
    { key: "phone",    bot: "Got it. And a phone number, in case email's slow?" },
    { key: "interest", bot: "Last thing — what are you interested in? (e.g. a quote, more info, booking)" },
    { key: "done",     bot: "done" }
  ];

  let stepIndex = 0;
  let data = {};

  const chatBubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const closeBtn = document.getElementById('close-btn');
  const successMsg = document.getElementById('success-msg');
  const inputArea = document.getElementById('chat-input-area');

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = sender === 'bot' ? 'bot-msg' : 'user-msg';
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function startChat() {
    if (chatBody.children.length === 0) {
      addMessage(steps[0].bot, 'bot');
    }
  }

  chatBubble.addEventListener('click', () => {
    chatWindow.style.display = 'flex';
    chatBubble.style.display = 'none';
    startChat();
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    chatBubble.style.display = 'flex';
  });

  function handleAnswer(answer) {
    addMessage(answer, 'user');

    const currentKey = steps[stepIndex].key;
    data[currentKey] = answer;

    stepIndex++;

    if (stepIndex < steps.length - 1) {
      const next = steps[stepIndex];
      const botText = typeof next.bot === 'function' ? next.bot(data) : next.bot;
      setTimeout(() => addMessage(botText, 'bot'), 400);
    } else {
      setTimeout(() => {
        addMessage("Perfect — sending that over now! 🎉", 'bot');
        submitLead(data);
      }, 400);
    }
  }

  chatSend.addEventListener('click', () => {
    const val = chatInput.value.trim();
    if (!val) return;
    chatInput.value = '';
    handleAnswer(val);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') chatSend.click();
  });

  // ---- 4. SEND LEAD TO BUSINESS OWNER ----
  function submitLead(lead) {
    console.log("LEAD CAPTURED:", lead);

    // Sends to Formspree -> forwards to the business owner's email.
    // Replace YOUR_FORM_ID with your real Formspree form ID.
    fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(lead)
    }).catch((err) => console.error("Lead submit failed:", err));

    setTimeout(() => {
      inputArea.style.display = 'none';
      successMsg.style.display = 'block';
    }, 600);
  }
})();
