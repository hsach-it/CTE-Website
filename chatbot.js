/* =====================================================================
   CTE PATHWAY ASSISTANT - floating chat widget
   Loaded on every page: <script src="js/chatbot.js" defer></script>
   Styles live in css/chatbot.css.

   ---------------------------------------------------------------------
   HOW TO CONNECT THE REAL CHATBOT (after administrative approval)
   ---------------------------------------------------------------------
   1. Set CHATBOT_CONFIG.provider below to 'botpress', 'voiceflow' or 'api'.
   2. Fill in the matching settings in CHATBOT_CONFIG.
   3. Finish the matching function in the "PROVIDER ADAPTERS" section.

   Two ways to integrate:
   A) Use the provider's own webchat embed (Botpress / Voiceflow).
      Their script draws its own floating widget, so loadProviderWidget()
      hides ours and loads theirs instead. Paste the embed snippet from
      the provider dashboard into loadBotpressWebchat() /
      loadVoiceflowWebchat().
   B) Keep THIS widget's look and send messages to an API.
      Fill in fetchApiReply(). IMPORTANT: never put a secret API key in
      this file - it is visible to every visitor. Call your own small
      server-side endpoint (e.g. a serverless function) that holds the
      key and forwards the message to the AI provider.

   Until then, provider 'demo' answers from getDemoReply(), which only
   uses information already published on this website.
   ===================================================================== */

const CHATBOT_CONFIG = {
  provider: 'demo',            // 'demo' | 'botpress' | 'voiceflow' | 'api'

  // Option A - Botpress webchat (values come from the Botpress dashboard)
  botpress: {
    injectScriptUrl: '',       // e.g. the "inject.js" URL from Botpress' embed code
    configScriptUrl: ''        // the bot-specific config script URL from Botpress
  },

  // Option A - Voiceflow webchat (values come from the Voiceflow dashboard)
  voiceflow: {
    projectID: '',
    versionID: 'production'
  },

  // Option B - your own server-side endpoint (never a public API key)
  api: {
    endpoint: '',              // e.g. '/api/chat' on your serverless function
    timeoutMs: 15000
  },

  // Widget text
  title: 'CTE Pathway Assistant',
  welcome: "Hi! I'm your CTE Pathway Assistant. Ask me anything about our 7+ pathways and 33+ courses!",
  demoLabel: 'Demo',
  demoDelayMs: 650,            // pause before demo answers, so it feels conversational

  // Quick-reply chips shown under the welcome message (clicking one sends it)
  suggestions: [
    'What are the CTE pathways?',
    'How do I sign up for a class?',
    'Show me the courses available'
  ],

  // Speech bubble shown next to the closed chat button when a page first loads
  teaser: {
    text: "Hi, I'm here to answer any questions! I'm the Horizon chatbot.",
    delayMs: 1200,             // wait a moment after the page loads
    oncePerVisit: true         // after it's dismissed, don't show it again on other pages this visit
  }
};


/* =====================================================================
   PROVIDER ADAPTERS  (replace these when going live)
   ===================================================================== */

/**
 * Returns the assistant's reply for one user message.
 * Every provider must resolve to: { text: string, links?: [{ label, href }] }
 * @param {string} message  what the visitor typed
 * @param {Array}  history  earlier messages: [{ role: 'user'|'assistant', text }]
 */
async function getBotReply(message, history) {
  switch (CHATBOT_CONFIG.provider) {
    case 'api':
      return fetchApiReply(message, history);
    case 'demo':
    default:
      await wait(CHATBOT_CONFIG.demoDelayMs);
      return getDemoReply(message);
  }
}

/**
 * Option B: send the message to YOUR server-side endpoint.
 * TODO (Phase 2 live): match the request/response shape of your endpoint.
 */
async function fetchApiReply(message, history) {
  if (!CHATBOT_CONFIG.api.endpoint) {
    return { text: 'The live assistant is not connected yet. Please try again later.' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHATBOT_CONFIG.api.timeoutMs);
  try {
    const res = await fetch(CHATBOT_CONFIG.api.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal: controller.signal
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return { text: String(data.reply || ''), links: Array.isArray(data.links) ? data.links : [] };
  } catch (err) {
    return { text: "Sorry, I couldn't reach the assistant right now. Please try again in a moment." };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Option A: Botpress webchat embed.
 * TODO (Phase 2 live): paste the two <script> URLs from
 * Botpress dashboard -> Webchat -> Embed into CHATBOT_CONFIG.botpress.
 */
function loadBotpressWebchat() {
  const { injectScriptUrl, configScriptUrl } = CHATBOT_CONFIG.botpress;
  if (!injectScriptUrl || !configScriptUrl) return false;
  loadScript(injectScriptUrl, () => loadScript(configScriptUrl));
  return true;
}

/**
 * Option A: Voiceflow webchat embed.
 * TODO (Phase 2 live): copy the embed snippet from
 * Voiceflow -> Integration -> Web chat, and make sure the script URL and
 * load() options below match it exactly (they change between versions).
 */
function loadVoiceflowWebchat() {
  const { projectID, versionID } = CHATBOT_CONFIG.voiceflow;
  if (!projectID) return false;
  loadScript('https://cdn.voiceflow.com/widget-next/bundle.mjs', () => {
    if (window.voiceflow && window.voiceflow.chat) {
      window.voiceflow.chat.load({
        verify: { projectID },
        url: 'https://general-runtime.voiceflow.com',
        versionID
      });
    }
  });
  return true;
}

/** Loads a provider's own widget instead of ours (Option A). */
function loadProviderWidget() {
  if (CHATBOT_CONFIG.provider === 'botpress') return loadBotpressWebchat();
  if (CHATBOT_CONFIG.provider === 'voiceflow') return loadVoiceflowWebchat();
  return false;
}


/* =====================================================================
   DEMO RESPONSES  (only facts already published on this site)
   ===================================================================== */

const SITE_INFO = {
  pathways: [
    {
      name: 'Software Development', page: 'programming.html',
      keywords: ['software', 'programming', 'coding', ' code', 'developer', 'web design', ' app ', ' apps', 'computer science'],
      summary: 'Learn the foundations of computer programming, app design, and software development, building problem-solving skills through real-world coding projects.'
    },
    {
      name: 'Cybersecurity', page: 'cybersecurity.html',
      keywords: ['cyber', 'security', 'hacking', 'network', 'comptia'],
      summary: 'Learn to protect digital systems, networks, and data - security principles, ethical hacking, and defense strategies - with CompTIA certifications.'
    },
    {
      name: 'Allied Health & Nursing', page: 'health.html',
      keywords: ['health', 'nursing', 'nurse', 'medical', 'hospital', 'stna', 'doctor'],
      summary: 'Explore healthcare careers from nursing to medical research, with an introduction to anatomy, patient care, and health systems.'
    },
    {
      name: 'Arts & Communication', page: 'arts.html',
      keywords: [' art', 'media', 'video', 'film', 'photo', 'graphic', 'design', 'broadcast', 'adobe', 'communication'],
      summary: 'Build creative and technical skills in media production, broadcasting, digital design, video editing, audio, and photography.'
    },
    {
      name: 'Business & Marketing', page: 'business.html',
      keywords: ['business', 'marketing', 'finance', 'entrepreneur', 'management', 'office'],
      summary: 'Develop leadership, communication, and entrepreneurial skills while learning marketing, finance, and management.'
    },
    {
      name: 'Exercise Science', page: 'excercise.html',
      keywords: ['exercise', 'fitness', 'sport', 'athletic', 'training', 'physical therapy', 'nasm', 'gym'],
      summary: 'Study how the body moves and performs through fitness, sports, anatomy, and physiology, with hands-on exercise and wellness experience.'
    },
    {
      name: 'Engineering & Manufacturing', page: 'engineering.html',
      keywords: ['engineer', 'manufactur', 'robot', 'mechanical', 'electrical', 'fanuc', 'plc', 'drone'],
      summary: 'Discover how science and math come together to design, test, and build solutions through hands-on engineering projects.'
    }
  ],
  enrollUrl: 'https://www.hsach.org/apps/pages/enroll',
  mainSite: 'https://www.hsach.org/',
  phone: '(614) 846-7616',
  email: 'info@hsach.org',
  campuses: [
    '9th & 10th Grade Building: 1070 Morse Rd., Columbus, OH 43229',
    '11th & 12th Grade Building: 3692 Corporate Dr., Columbus, OH 43231'
  ]
};

function getDemoReply(rawMessage) {
  // Lowercase and turn punctuation into spaces, so "Hi!" matches " hi "
  const msg = ' ' + rawMessage.toLowerCase().replace(/[^a-z0-9+&]+/g, ' ') + ' ';
  const has = (...words) => words.some(w => msg.includes(w));

  if (has(' hi ', ' hello', ' hey', 'good morning', 'good afternoon')) {
    return { text: 'Hello! I can tell you about our CTE pathways, classes, certifications, student organizations, enrollment, and how to contact the school. What would you like to know?' };
  }

  // Enrollment and contact come first so words like "apply" or "where" aren't
  // mistaken for a pathway keyword
  if (has('enroll', 'apply', 'application', 'register', 'admission', 'sign up')) {
    return {
      text: 'You can start enrollment on the Horizon Science Academy Columbus High School website.',
      links: [{ label: 'Enroll Now', href: SITE_INFO.enrollUrl }]
    };
  }

  if (has('contact', 'phone', 'call ', 'email', 'address', 'location', 'located', 'where is', 'campus', 'building')) {
    return {
      text: `You can reach the school at ${SITE_INFO.phone} or ${SITE_INFO.email}. Campuses - ${SITE_INFO.campuses.join('; ')}.`
    };
  }

  // A specific pathway
  const match = SITE_INFO.pathways.find(p => p.keywords.some(k => msg.includes(k)));
  if (match && !has('all pathways', 'list', 'which pathways', 'what pathways')) {
    return {
      text: `${match.name}: ${match.summary} The pathway page lists its classes, certifications, clubs, and career options.`,
      links: [{ label: `Open ${match.name}`, href: match.page }]
    };
  }

  if (has('pathway', 'program', 'options', 'choose', 'offer')) {
    return {
      text: 'We offer 7 CTE pathways. Pick one to see its classes, certifications, and careers:',
      links: SITE_INFO.pathways.map(p => ({ label: p.name, href: p.page }))
    };
  }

  if (has('class', 'course', 'curriculum', 'subject')) {
    return {
      text: 'There are 33+ CTE courses across our 7 pathways. Each pathway page has a "Classes" section - tap "Click here to see classes!" to see the full list.',
      links: SITE_INFO.pathways.map(p => ({ label: p.name, href: p.page }))
    };
  }

  if (has('certif', 'credential', 'license')) {
    return {
      text: 'Students can earn industry-recognized certifications in every pathway - for example CompTIA in Cybersecurity, Microsoft Office Specialist in Business, STNA and BLS/CPR in Allied Health, and FANUC and OSHA in Engineering. Each pathway page lists its certifications.',
      links: SITE_INFO.pathways.map(p => ({ label: p.name, href: p.page }))
    };
  }

  if (has('club', 'organization', 'bpa', 'hosa', 'skillsusa', 'competition', 'extracurricular')) {
    return {
      text: 'Our students compete in national organizations including BPA (Business Professionals of America), HOSA (Health Occupations Students of America), and SkillsUSA. Each pathway page also lists its clubs.',
      links: [{ label: 'National Organizations', href: 'national_orgs.html' }]
    };
  }

  if (has('news', 'event', 'announcement', 'update')) {
    return {
      text: 'Check the News page for the latest announcements and student achievements.',
      links: [{ label: 'Latest News', href: 'news.html' }]
    };
  }

  if (has('career', 'job', 'college', 'future')) {
    return {
      text: 'Every pathway prepares students for college and careers - each pathway page has a "Careers" section with example jobs.',
      links: SITE_INFO.pathways.map(p => ({ label: p.name, href: p.page }))
    };
  }

  if (has('thank')) {
    return { text: "You're welcome! Is there anything else you'd like to know about our CTE pathways?" };
  }

  return {
    text: "I'm running in demo mode, so I can only answer general questions about our CTE pathways, classes, certifications, clubs, enrollment, and contact info. For anything else, please visit the school website or call " + SITE_INFO.phone + '.',
    links: [{ label: 'School website', href: SITE_INFO.mainSite }]
  };
}


/* =====================================================================
   WIDGET UI  (no changes needed when switching providers)
   ===================================================================== */

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadScript(src, onload) {
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  if (src.endsWith('.mjs')) s.type = 'module';
  if (onload) s.onload = onload;
  document.head.appendChild(s);
}

(function initChatWidget() {
  if (document.getElementById('cteChat')) return;   // already on the page

  // Option A providers draw their own widget
  if (CHATBOT_CONFIG.provider !== 'demo' && CHATBOT_CONFIG.provider !== 'api') {
    if (loadProviderWidget()) return;
  }

  const ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6A.5.5 0 0 1 5 19.2V16h-.5A2.5 2.5 0 0 1 2 13.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8.5" cy="9.5" r="1.2" fill="currentColor"/><circle cx="12" cy="9.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="9.5" r="1.2" fill="currentColor"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

  // ---------- Build the widget ----------
  const root = document.createElement('div');
  root.id = 'cteChat';
  root.className = 'cte-chat';
  root.innerHTML = `
    <section class="cte-chat__window" id="cteChatWindow" role="dialog" aria-modal="false"
             aria-labelledby="cteChatTitle" hidden>
      <header class="cte-chat__header">
        <span class="cte-chat__avatar" aria-hidden="true">${ICON_CHAT}</span>
        <div class="cte-chat__heading">
          <h2 class="cte-chat__title" id="cteChatTitle"></h2>
          <span class="cte-chat__status"></span>
        </div>
        <button type="button" class="cte-chat__close" aria-label="Close chat">${ICON_CLOSE}</button>
      </header>
      <div class="cte-chat__log" id="cteChatLog" role="log" aria-live="polite" aria-relevant="additions"></div>
      <form class="cte-chat__form" autocomplete="off">
        <label for="cteChatInput" class="cte-chat__sr-only">Type your question</label>
        <input type="text" id="cteChatInput" class="cte-chat__input" maxlength="500"
               placeholder="Ask about pathways, classes, enrollment...">
        <button type="submit" class="cte-chat__send">
          <span>Send</span>${ICON_SEND}
        </button>
      </form>
    </section>
    <div class="cte-chat__teaser" role="status" hidden>
      <button type="button" class="cte-chat__teaser-text"></button>
      <button type="button" class="cte-chat__teaser-close" aria-label="Dismiss message">${ICON_CLOSE}</button>
    </div>
    <button type="button" class="cte-chat__launcher" aria-controls="cteChatWindow"
            aria-expanded="false" aria-label="Open the CTE Pathway Assistant">
      <span class="cte-chat__launcher-icon cte-chat__launcher-icon--chat">${ICON_CHAT}</span>
      <span class="cte-chat__launcher-icon cte-chat__launcher-icon--close">${ICON_CLOSE}</span>
    </button>`;
  document.body.appendChild(root);

  const win = root.querySelector('.cte-chat__window');
  const launcher = root.querySelector('.cte-chat__launcher');
  const closeBtn = root.querySelector('.cte-chat__close');
  const log = root.querySelector('.cte-chat__log');
  const form = root.querySelector('.cte-chat__form');
  const input = root.querySelector('.cte-chat__input');
  const sendBtn = root.querySelector('.cte-chat__send');

  root.querySelector('.cte-chat__title').textContent = CHATBOT_CONFIG.title;
  root.querySelector('.cte-chat__status').textContent =
    CHATBOT_CONFIG.provider === 'demo' ? CHATBOT_CONFIG.demoLabel : 'Online';

  const history = [];
  let busy = false;

  // ---------- Messages ----------
  function addMessage(role, reply) {
    const row = document.createElement('div');
    row.className = 'cte-chat__msg cte-chat__msg--' + (role === 'user' ? 'user' : 'bot');

    const bubble = document.createElement('div');
    bubble.className = 'cte-chat__bubble';
    bubble.textContent = reply.text;              // textContent: never renders HTML

    if (reply.links && reply.links.length) {
      const links = document.createElement('div');
      links.className = 'cte-chat__links';
      reply.links.forEach(l => {
        const a = document.createElement('a');
        a.className = 'cte-chat__link';
        a.href = l.href;
        a.textContent = l.label;
        if (/^https?:/i.test(l.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        links.appendChild(a);
      });
      bubble.appendChild(links);
    }

    row.appendChild(bubble);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    history.push({ role: role === 'user' ? 'user' : 'assistant', text: reply.text });
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'cte-chat__msg cte-chat__msg--bot cte-chat__msg--typing';
    row.setAttribute('aria-label', 'Assistant is typing');
    row.innerHTML = '<div class="cte-chat__bubble"><span></span><span></span><span></span></div>';
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  // Quick-reply chips: clicking one sends it as the visitor's message
  function addSuggestions(list) {
    if (!list || !list.length) return;
    const row = document.createElement('div');
    row.className = 'cte-chat__suggestions';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Suggested questions');
    list.forEach(text => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'cte-chat__chip';
      chip.textContent = text;
      chip.addEventListener('click', () => sendMessage(text));
      row.appendChild(chip);
    });
    log.appendChild(row);
  }

  addMessage('bot', { text: CHATBOT_CONFIG.welcome });
  addSuggestions(CHATBOT_CONFIG.suggestions);

  // ---------- Open / close ----------
  function setOpen(open) {
    win.hidden = !open;
    root.classList.toggle('is-open', open);
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    launcher.setAttribute('aria-label', open ? 'Close the CTE Pathway Assistant' : 'Open the CTE Pathway Assistant');
    if (open) {
      hideTeaser();
      log.scrollTop = log.scrollHeight;
      input.focus();
    }
  }

  launcher.addEventListener('click', () => setOpen(win.hidden));
  closeBtn.addEventListener('click', () => {
    setOpen(false);
    launcher.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !win.hidden) {
      setOpen(false);
      launcher.focus();
    }
  });

  // ---------- Sending ----------
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  async function sendMessage(rawText) {
    const text = String(rawText || '').trim();
    if (!text || busy) return;

    busy = true;
    sendBtn.disabled = true;
    log.querySelectorAll('.cte-chat__chip').forEach(c => { c.disabled = true; });
    input.value = '';
    addMessage('user', { text });

    const typing = showTyping();
    let reply;
    try {
      reply = await getBotReply(text, history.slice(0, -1));
    } catch (err) {
      reply = { text: 'Sorry, something went wrong. Please try again.' };
    }
    typing.remove();
    addMessage('bot', reply && reply.text ? reply : { text: "Sorry, I don't have an answer for that yet." });

    busy = false;
    sendBtn.disabled = false;
    log.querySelectorAll('.cte-chat__chip').forEach(c => { c.disabled = false; });
    input.focus();
  }

  // ---------- Pop-up speech bubble (teaser) ----------
  const teaser = root.querySelector('.cte-chat__teaser');
  const teaserText = root.querySelector('.cte-chat__teaser-text');
  const teaserClose = root.querySelector('.cte-chat__teaser-close');
  const TEASER_KEY = 'cteChatTeaserDismissed';
  teaserText.textContent = CHATBOT_CONFIG.teaser.text;

  function teaserAlreadyDismissed() {
    if (!CHATBOT_CONFIG.teaser.oncePerVisit) return false;
    try { return sessionStorage.getItem(TEASER_KEY) === '1'; } catch (err) { return false; }
  }

  function showTeaser() {
    if (!win.hidden || teaserAlreadyDismissed()) return;
    teaser.hidden = false;
    scrollStart = window.scrollY;                                      // measure scrolling from here
    requestAnimationFrame(() => teaser.classList.add('is-visible'));   // fade in
    // Any interaction with the page (outside the widget) dismisses it
    document.addEventListener('pointerdown', onPageInteraction, true);
    document.addEventListener('keydown', onPageInteraction, true);
    window.addEventListener('scroll', onPageInteraction, { passive: true });
  }

  function hideTeaser() {
    if (teaser.hidden) return;
    try { sessionStorage.setItem(TEASER_KEY, '1'); } catch (err) { /* storage blocked - fine */ }
    document.removeEventListener('pointerdown', onPageInteraction, true);
    document.removeEventListener('keydown', onPageInteraction, true);
    window.removeEventListener('scroll', onPageInteraction);
    teaser.classList.remove('is-visible');                              // fade out
    setTimeout(() => { teaser.hidden = true; }, 300);
  }

  let scrollStart = 0;
  function onPageInteraction(e) {
    if (e.type === 'scroll') {
      // ignore tiny scrolls (e.g. the browser nudging the position)
      if (Math.abs(window.scrollY - scrollStart) < 120) return;
    } else if (root.contains(e.target)) {
      return;                                                           // clicks inside the widget are handled below
    }
    hideTeaser();
  }

  teaserText.addEventListener('click', () => setOpen(true));             // clicking the bubble opens the chat
  teaserClose.addEventListener('click', hideTeaser);

  setTimeout(showTeaser, CHATBOT_CONFIG.teaser.delayMs);
})();
