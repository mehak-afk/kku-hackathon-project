(() => {
  "use strict";
  const data = window.cvData;
  if (!data) { document.body.innerHTML = "<p>Sample CV data could not be loaded.</p>"; return; }
  const STORAGE_KEY = "bilingual-cv-locale";
  const COPY = {
    en: { downloadPdf: "Download PDF", portfolioLabel: "Bilingual CV · Portfolio", education: "Education", skills: "Skills", experience: "Experience", selectedProjects: "Selected projects", footerNote: "Editable sample template · Replace details in sample-data/data.js", availability: "Available for thoughtful opportunities", printNote: "Save as PDF in the print dialog. For the cleanest result, turn off headers and footers.", email: "Email", location: "Location", showing: c => `Showing ${c} ${c === 1 ? "project" : "projects"}.`, noProjects: "No projects in this category yet." },
    ar: { downloadPdf: "تنزيل PDF", portfolioLabel: "سيرة ذاتية ثنائية اللغة · معرض أعمال", education: "التعليم", skills: "المهارات", experience: "الخبرة", selectedProjects: "مشاريع مختارة", footerNote: "نموذج قابل للتعديل · استبدل البيانات في sample-data/data.js", availability: "متاح لفرص ملهمة", printNote: "اختر «حفظ بصيغة PDF» من نافذة الطباعة. لأفضل نتيجة، أوقف الرؤوس والتذييلات.", email: "البريد الإلكتروني", location: "الموقع", showing: c => `عرض ${c} ${c === 1 ? "مشروع" : "مشاريع"}.`, noProjects: "لا توجد مشاريع في هذه الفئة حتى الآن." }
  };
  const state = { locale: loadLocale(), filter: "all" };
  const $ = s => document.querySelector(s);
  const el = { name: $("#profileName"), headline: $("#profileHeadline"), summary: $("#profileSummary"), contact: $("#contactList"), education: $("#educationList"), skills: $("#skillsList"), experience: $("#experienceList"), projects: $("#projectsGrid"), filters: $("#projectFilters"), status: $("#projectStatus"), print: $("#printButton") };
  function loadLocale() { try { return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en"; } catch (_) { return "en"; } }
  function saveLocale() { try { localStorage.setItem(STORAGE_KEY, state.locale); } catch (_) {} }
  function text(value) { return value?.[state.locale] ?? ""; }
  function put(node, value) { node.textContent = value; return node; }
  function renderCopy() {
    const c = COPY[state.locale]; document.documentElement.lang = state.locale; document.documentElement.dir = state.locale === "ar" ? "rtl" : "ltr"; document.title = state.locale === "ar" ? "قالب السيرة الذاتية ومعرض الأعمال" : "CV Portfolio Template";
    document.querySelectorAll("[data-copy]").forEach(n => put(n, c[n.dataset.copy]));
    document.querySelector(".language-switch").setAttribute("aria-label", state.locale === "ar" ? "اختر اللغة" : "Choose language");
    document.querySelectorAll(".language-button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.locale === state.locale)));
    el.print.setAttribute("aria-label", state.locale === "ar" ? "تنزيل PDF: يفتح نافذة الطباعة" : "Download PDF: opens the print dialog");
  }
  function renderProfile() {
    const c = COPY[state.locale]; put(el.name, text(data.profile.name)); put(el.headline, text(data.profile.headline)); put(el.summary, text(data.profile.summary)); el.contact.replaceChildren();
    const email = document.createElement("a"); email.href = `mailto:${data.profile.email}`; email.className = "contact-item contact-email"; email.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 7l9 7 9-7"/></svg><span></span>'; put(email.querySelector("span"), data.profile.email); email.setAttribute("aria-label", `${c.email}: ${data.profile.email}`);
    const location = document.createElement("div"); location.className = "contact-item"; location.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span></span>'; put(location.querySelector("span"), text(data.profile.location)); el.contact.append(email, location);
  }
  function renderEducation() { el.education.replaceChildren(); data.education.forEach(i => { const e = document.createElement("article"); e.className = "education-entry"; e.innerHTML = "<p class='entry-period'></p><h3></h3><p class='entry-place'></p><p class='entry-detail'></p>"; put(e.querySelector(".entry-period"), text(i.period)); put(e.querySelector("h3"), text(i.degree)); put(e.querySelector(".entry-place"), text(i.institution)); put(e.querySelector(".entry-detail"), text(i.detail)); el.education.append(e); }); }
  function renderSkills() { el.skills.replaceChildren(); data.skills.forEach(i => { const n = document.createElement("li"); n.textContent = text(i); el.skills.append(n); }); }
  function renderExperience() { el.experience.replaceChildren(); data.experience.forEach(i => { const e = document.createElement("article"); e.className = "experience-entry"; const h = document.createElement("div"); h.className = "experience-heading"; h.innerHTML = "<div><h3></h3><p></p></div><p class='entry-period'></p>"; put(h.querySelector("h3"), text(i.role)); put(h.querySelector("div p"), text(i.company)); put(h.querySelector(".entry-period"), text(i.period)); const ul = document.createElement("ul"); i.bullets[state.locale].forEach(b => { const li = document.createElement("li"); li.textContent = b; ul.append(li); }); e.append(h, ul); el.experience.append(e); }); }
  function projects() { return state.filter === "all" ? data.projects : data.projects.filter(p => p.category === state.filter); }
  function renderFilters() { el.filters.replaceChildren(); Object.entries(data.filters).forEach(([key, label]) => { const b = document.createElement("button"); b.type = "button"; b.className = "filter-button"; b.dataset.filter = key; b.textContent = text(label); const active = state.filter === key; b.setAttribute("aria-pressed", String(active)); if (active) b.classList.add("is-active"); el.filters.append(b); }); el.filters.setAttribute("aria-label", state.locale === "ar" ? "تصفية المشاريع" : "Filter projects"); }
  function renderProjects() { const c = COPY[state.locale], list = projects(); el.projects.replaceChildren(); el.status.textContent = list.length ? c.showing(list.length) : c.noProjects; list.forEach((p, x) => { const card = document.createElement("article"); card.className = "project-card"; card.innerHTML = `<div class="project-visual visual-${p.visual}" aria-hidden="true"><span>${String(x + 1).padStart(2, "0")}</span><i></i><b></b></div><div class="project-copy"><p class="project-category"></p><h3></h3><p class="project-summary"></p><ul class="technology-list"></ul></div>`; put(card.querySelector(".project-category"), text(data.filters[p.category])); put(card.querySelector("h3"), text(p.title)); put(card.querySelector(".project-summary"), text(p.summary)); p.technologies.forEach(t => { const li = document.createElement("li"); li.textContent = t; card.querySelector(".technology-list").append(li); }); el.projects.append(card); }); }
  function render() { renderCopy(); renderProfile(); renderEducation(); renderSkills(); renderExperience(); renderFilters(); renderProjects(); }
  document.addEventListener("click", event => { const l = event.target.closest(".language-button"); if (l) { state.locale = l.dataset.locale; saveLocale(); render(); return; } const f = event.target.closest(".filter-button"); if (f) { state.filter = f.dataset.filter; renderFilters(); renderProjects(); } });
  el.print.addEventListener("click", () => window.print()); render();
})();
