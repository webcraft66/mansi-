  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Cursor-follow glow (desktop only, respects reduced motion)
  const glow = document.getElementById('glow');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  } else {
    glow.style.display = 'none';
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const panel = document.getElementById('mobile-panel');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');
  let menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.style.opacity = '1';
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
    } else {
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => setMenu(false)));

  // Smooth scroll for all nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });

  // Active nav link on scroll
  const sections = ['home','skills','education','projects','contact'].map(id => document.getElementById(id));
  const navLinks = document.querySelectorAll('[data-nav]');
  const activateLink = (id) => {
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + id);
    });
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activateLink(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => s && sectionObserver.observe(s));

  // Reveal-on-scroll animations
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Skill bar fill animation
  const bars = document.querySelectorAll('.skill-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => barObserver.observe(b));

  // Typewriter effect in hero
  const roles = [
    'Building autonomous AI agents.',
    'Engineering with Python & Django.',
    'Designing clean, scalable systems.',
    'Open for AI & Software roles.'
  ];
  const twEl = document.getElementById('typewriter');
  if (!prefersReduced) {
    let roleIdx = 0, charIdx = 0, deleting = false;
    function tick() {
      const current = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        twEl.innerHTML = current.slice(0, charIdx) + '<span class="cursor-caret"></span>';
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIdx--;
        twEl.innerHTML = current.slice(0, charIdx) + '<span class="cursor-caret"></span>';
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 55);
    }
    tick();
  } else {
    twEl.textContent = roles[0];
  }

  /* ============ MANSI-BOT ============ */
  (function () {
    let history = []; // [{ role: 'user'|'model', parts: [{text}] }]
    let sending = false;

    const launcher = document.getElementById('bot-launcher');
    const iconChat = document.getElementById('bot-icon-chat');
    const iconClose = document.getElementById('bot-icon-close');
    const panel = document.getElementById('bot-panel');
    const closeBtn = document.getElementById('bot-close-btn');
    const clearBtn = document.getElementById('bot-clear-btn');
    const messagesEl = document.getElementById('bot-messages');
    const typingEl = document.getElementById('bot-typing');
    const form = document.getElementById('bot-form');
    const input = document.getElementById('bot-input');
    const sendBtn = document.getElementById('bot-send-btn');

    const WELCOME_TEXT = "Hi! I'm Mansi-Bot 👋 Mansi's AI portfolio assistant. Ask me about her skills, projects, education, or how to get in touch.";
    let panelOpen = false;

    function setPanelOpen(open) {
      panelOpen = open;
      panel.classList.toggle('hidden', !open);
      panel.classList.toggle('flex', open);
      iconChat.classList.toggle('hidden', open);
      iconClose.classList.toggle('hidden', !open);
      if (open) {
        if (messagesEl.children.length === 0) addMessage('model', WELCOME_TEXT);
        input.focus();
      }
    }

    launcher.addEventListener('click', () => setPanelOpen(!panelOpen));
    closeBtn.addEventListener('click', () => setPanelOpen(false));

    clearBtn.addEventListener('click', () => {
      history = [];
      messagesEl.innerHTML = '';
      addMessage('model', WELCOME_TEXT);
    });

    function addMessage(role, text) {
      const wrap = document.createElement('div');
      wrap.className = role === 'user' ? 'flex justify-end' : 'flex justify-start';
      const bubble = document.createElement('div');
      bubble.className = role === 'user'
        ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-500 text-white text-sm leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap'
        : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-white/[0.05] border border-line text-zinc-200 text-sm leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap';
      bubble.textContent = text;
      wrap.appendChild(bubble);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return bubble;
    }

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 112) + 'px';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    async function callBot(userText) {
      history.push({ role: 'user', parts: [{ text: userText }] });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: history }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error((data && data.error) || `Request failed (${res.status})`);
      }
      if (!data || !data.text) {
        throw new Error('Empty response from Mansi-Bot.');
      }

      history.push({ role: 'model', parts: [{ text: data.text }] });
      return data.text;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || sending) return;

      addMessage('user', text);
      input.value = '';
      input.style.height = 'auto';

      sending = true;
      sendBtn.disabled = true;
      typingEl.classList.remove('hidden');
      typingEl.classList.add('flex');
      messagesEl.scrollTop = messagesEl.scrollHeight;

      try {
        const reply = await callBot(text);
        addMessage('model', reply);
      } catch (err) {
        history.pop(); // drop the failed user turn so retry works cleanly
        addMessage('model', `⚠️ ${err.message || 'Something went wrong. Please try again in a moment.'}`);
      } finally {
        sending = false;
        sendBtn.disabled = false;
        typingEl.classList.add('hidden');
        typingEl.classList.remove('flex');
      }
    });
  })();
