/* =========================================================================
   HORIZON SCIENCE ACADEMY — script.js
   Shared behavior for every page. Sections:
     1. Navigation (mobile menu toggle, active link highlight)
     2. Chatbot (chatbot.html only — the rest of the file no-ops elsewhere)
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. NAVIGATION
   ------------------------------------------------------------------------- */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Highlight the nav link that matches the current page.
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
}

/* -------------------------------------------------------------------------
   2. CHATBOT
   ------------------------------------------------------------------------- */

/**
 * getAIResponse(userMessage)
 * ---------------------------------------------------------------------
 * THIS is the single function to replace when a real AI API is wired up.
 *
 * This is HSACH's site assistant — a plain, conversational helper for
 * generic questions a visitor or student might have (hours, contact info,
 * enrollment, programs, activities, etc.), the same way a typical
 * website chat widget works. It looks at keywords in the user's message
 * and returns a short, friendly placeholder answer as plain HTML
 * paragraphs — no special formatting or sections.
 *
 * To connect a real API later:
 *   1. Make this function `async`.
 *   2. Replace the body with a fetch() call to your AI API
 *      (OpenAI, Google Gemini, Anthropic, etc). Do NOT hardcode an API
 *      key here — call your own backend/serverless endpoint, which holds
 *      the key, instead of calling the AI provider directly from the browser.
 *   3. Keep the return shape the same: a string of HTML that
 *      appendMessage() can drop straight into a bubble.
 *   4. Everywhere this function is called, the caller already `await`s it
 *      (see sendMessage()), so switching to async requires no other changes.
 *
 * Example of what step 2 will eventually look like:
 *
 *   async function getAIResponse(userMessage) {
 *     const response = await fetch("/api/chat", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ message: userMessage }),
 *     });
 *     const data = await response.json();
 *     return data.reply;
 *   }
 */
async function getAIResponse(userMessage) {
  const message = userMessage.toLowerCase();

  // --- Off-topic / out-of-scope guardrails -------------------------------
  const refusalTriggers = [
    { test: /\b(name|address|phone|ssn|social security|specific student|student's? (record|file|grade|transcript|id))\b/, reply: refusalResponse("private student information") },
    { test: /\b(diagnos|medicat|therap|prescri|symptom|mental health)\b/, reply: refusalResponse("medical advice") },
    { test: /\b(lawsuit|sue|legal advice|contract|liability|attorney)\b/, reply: refusalResponse("legal advice") },
  ];
  for (const trigger of refusalTriggers) {
    if (trigger.test.test(message)) {
      return trigger.reply;
    }
  }

  // --- Topic-matched placeholder responses --------------------------------
  if (message.includes("hour") || message.includes("open") || message.includes("time")) {
    return `<p>School hours run Monday through Friday during the regular academic calendar. For the exact bell schedule or early-release days, check the calendar on our homepage or give the front office a call.</p>`;
  }

  if (message.includes("address") || message.includes("location") || message.includes("where")) {
    return `<p>HSACH — Horizon Science Academy Columbus High — is located here in Columbus, Ohio. You can find directions and our full address on the Contact section of the site.</p>`;
  }

  if (message.includes("contact") || message.includes("phone") || message.includes("email") || message.includes("call")) {
    return `<p>You can reach the front office by phone or email — details are listed on our Contact page. For questions about a specific class or pathway, it's usually fastest to reach out to that teacher or your counselor directly.</p>`;
  }

  if (message.includes("enroll") || message.includes("apply") || message.includes("admission")) {
    return `<p>You can start the enrollment process anytime from the <strong>Enroll Now</strong> link at the top of the site. It walks you through the application steps, and our enrollment team is happy to answer questions along the way.</p>`;
  }

  if (message.includes("pathway") || message.includes("program") || message.includes("cte")) {
    return `<p>HSACH offers several CTE pathways — including Cybersecurity — that combine regular coursework with hands-on, career-focused training and industry-recognized certifications. Check out the <strong>Pathways</strong> page for the full list, or ask me about a specific one.</p>`;
  }

  if (message.includes("class") || message.includes("course") || message.includes("schedule")) {
    return `<p>Course offerings depend on grade level and pathway. Your counselor can help you build a schedule that fits your interests — and each pathway's page lists its own course sequence.</p>`;
  }

  if (message.includes("sport") || message.includes("athletic") || message.includes("club") || message.includes("activit")) {
    return `<p>HSACH offers a range of sports, clubs, and after-school activities. Check the school calendar or ask the front office for the current list and sign-up details.</p>`;
  }

  if (message.includes("lunch") || message.includes("meal") || message.includes("food")) {
    return `<p>Lunch menus and meal program details are typically posted on the school's homepage or shared through the front office — they can also let you know about free and reduced-price meal options.</p>`;
  }

  if (message.includes("transport") || message.includes("bus")) {
    return `<p>For bus routes and transportation questions, the front office can point you to the current schedule for your area.</p>`;
  }

  if (message.includes("hi") || message.includes("hello") || message.includes("hey")) {
    return `<p>Hi there! I'm the HSACH site assistant. Ask me about enrollment, our CTE pathways, school hours, contact info, or anything else about Horizon Science Academy Columbus High.</p>`;
  }

  // --- Default / fallback --------------------------------------------------
  return `<p>I'm the HSACH site assistant — I can help with general questions like school hours, contact info, enrollment, our CTE pathways, or activities. What would you like to know?</p>`;
}

/**
 * refusalResponse(topic)
 * Builds the polite redirect used for out-of-scope requests
 * (private student info, medical advice, legal advice, off-topic chat).
 */
function refusalResponse(topic) {
  return `<p>I'm just the HSACH site assistant, so I'm not able to help with ${topic}.</p>
  <p>For that, please reach out to the front office or your counselor directly. I'm happy to help with general questions about hours, enrollment, pathways, or contact info instead.</p>`;
}

/**
 * escapeHTML(str)
 * Escapes user input before it's inserted into the page, so a message
 * can never be interpreted as HTML/script.
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * appendMessage(role, htmlContent)
 * Adds one chat bubble to the log and scrolls it into view.
 * role is either "user" or "ai".
 */
function appendMessage(role, htmlContent) {
  const log = document.getElementById("chatLog");
  if (!log) return;

  const wrapper = document.createElement("div");
  wrapper.className = `msg msg-${role}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "ai" ? "AI" : "You";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = htmlContent;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  log.appendChild(wrapper);

  log.scrollTop = log.scrollHeight;
  return wrapper;
}

/**
 * showTypingIndicator() / removeTypingIndicator()
 * Shows a small "AI is thinking" bubble while getAIResponse() runs —
 * useful now for the placeholder delay, and still useful later once a
 * real API call takes a moment to respond.
 */
function showTypingIndicator() {
  const wrapper = appendMessage("ai", `<div class="typing-dots"><span></span><span></span><span></span></div>`);
  wrapper.id = "typingIndicator";
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

/**
 * sendMessage(text)
 * Handles one full round trip: show the user's message, show a typing
 * indicator, get the (placeholder, later real) AI response, then swap
 * the indicator for the actual reply.
 */
async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  appendMessage("user", escapeHTML(trimmed));

  const input = document.getElementById("chatInput");
  if (input) input.value = "";

  showTypingIndicator();

  // Small delay so the typing indicator is visible — mirrors the latency
  // a real API call will have, so no UI changes are needed later.
  await new Promise((resolve) => setTimeout(resolve, 650));

  const reply = await getAIResponse(trimmed);
  removeTypingIndicator();
  appendMessage("ai", reply);
}

function initChatbot() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  if (!form || !input) return; // Not on the chatbot page — nothing to do.

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  // Suggested prompt chips fill the input and send immediately.
  document.querySelectorAll(".prompt-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sendMessage(chip.textContent);
    });
  });
}

/* -------------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initChatbot();
});