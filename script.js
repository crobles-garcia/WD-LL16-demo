const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotMessages = document.getElementById('chatbotMessages');

const chatHistory = [
  {
    role: "system",
    content: "You are WayChat, a helpful and friendly assistant that gives concise, professional responses to user questions."
  }
];

if (chatbotToggleBtn && chatbotPanel) {
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (
      chatbotPanel.classList.contains('open') &&
      !chatbotPanel.contains(e.target) &&
      !chatbotToggleBtn.contains(e.target)
    ) {
      chatbotPanel.classList.remove('open');
    }
  });
}

async function sendMessageToChatbot(message) {
  if (!message.trim()) return;

  chatHistory.push({ role: "user", content: message });

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = message;
  chatbotMessages.appendChild(userMsg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  chatbotInput.value = '';

  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'message bot typing';
  thinkingMsg.textContent = 'WayChat is thinking...';
  chatbotMessages.appendChild(thinkingMsg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: chatHistory,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await res.json();
    chatbotMessages.removeChild(thinkingMsg);

    const botReply = data.choices?.[0]?.message?.content || "No response from the bot.";
    chatHistory.push({ role: "assistant", content: botReply });

    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerHTML = botReply.replace(/\n/g, '<br>');
    chatbotMessages.appendChild(botMsg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  } catch (err) {
    chatbotMessages.removeChild(thinkingMsg);
    const errMsg = document.createElement('div');
    errMsg.className = 'message bot';
    errMsg.textContent = `Error: ${err.message}`;
    chatbotMessages.appendChild(errMsg);
  }
}

chatbotSendBtn.addEventListener('click', () => {
  sendMessageToChatbot(chatbotInput.value);
});

chatbotInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessageToChatbot(chatbotInput.value);
  }
});
