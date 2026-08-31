const STORAGE_KEY = "relay-outreach-v5";
const remoteStorage = globalThis.RelaySupabaseStorage;
const REMOTE_CONFIGURED = Boolean(remoteStorage?.configured);
const day = 86400000;
const iso = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const calendarDay = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${calendarDay}`;
};
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const discoveryPool = [
  { company: "Sunroom Property Media", type: "Photography", location: "Scottsdale, AZ", website: "https://example.com/sunroom", contactForm: "https://example.com/sunroom/contact", email: "", phone: "(480) 555-0187", contactName: "", contactTitle: "", fit: 91, status: "new", reason: "Active residential portfolio; aerial services are not listed." },
  { company: "Stay Juniper", type: "Airbnb Management", location: "Austin, TX", website: "https://example.com/juniper", contactForm: "https://example.com/juniper/contact", email: "partners@example.com", phone: "(512) 555-0114", contactName: "Maya Chen", contactTitle: "Marketing Manager", fit: 88, status: "new", reason: "Manages design-forward short-term rentals across Austin." },
  { company: "Frame & Field RE", type: "Photography", location: "Charlotte, NC", website: "https://example.com/framefield", contactForm: "https://example.com/framefield/contact", email: "hello@example.com", phone: "", contactName: "", contactTitle: "", fit: 84, status: "new", reason: "Offers listing photography and floor plans without aerial imagery." },
  { company: "Cactus Key Stays", type: "Airbnb Management", location: "Tucson, AZ", website: "https://example.com/cactuskey", contactForm: "https://example.com/cactuskey/contact", email: "", phone: "(520) 555-0162", contactName: "", contactTitle: "", fit: 82, status: "new", reason: "Local manager with properties emphasizing outdoor amenities." },
  { company: "Northstar Listing Co.", type: "Photography", location: "Boise, ID", website: "https://example.com/northstar", contactForm: "https://example.com/northstar/contact", email: "team@example.com", phone: "(208) 555-0141", contactName: "Jordan Lee", contactTitle: "Owner", fit: 79, status: "new", reason: "Small owner-led real-estate media company." },
  { company: "Roam Nashville", type: "Airbnb Management", location: "Nashville, TN", website: "https://example.com/roam", contactForm: "https://example.com/roam/contact", email: "", phone: "(615) 555-0179", contactName: "", contactTitle: "", fit: 77, status: "new", reason: "Portfolio appears focused on centrally located group stays." }
];

const seed = () => ({
  settings: { attemptThreshold: 4, staleDays: 5, discoveryTarget: 5 },
  leads: [
    { id: "lead-1", company: "Lone Star Listing Photos", type: "Photography", location: "Dallas, TX", website: "https://example.com/lonestar", contactForm: "https://example.com/lonestar/contact", email: "hello@example.com", phone: "(214) 555-0138", contactName: "", contactTitle: "", fit: 94, status: "new", reason: "Strong residential portfolio with no aerial service listed.", collectedAt: iso(0) },
    { id: "lead-2", company: "Desert Door Stays", type: "Airbnb Management", location: "Phoenix, AZ", website: "https://example.com/desertdoor", contactForm: "https://example.com/desertdoor/contact", email: "", phone: "(602) 555-0192", contactName: "", contactTitle: "", fit: 89, status: "new", reason: "Manages homes with pools and outdoor amenities.", collectedAt: iso(0) },
    { id: "lead-3", company: "Vista Haus Media", type: "Photography", location: "Las Vegas, NV", website: "https://example.com/vistahaus", contactForm: "https://example.com/vistahaus/contact", email: "studio@example.com", phone: "(702) 555-0151", contactName: "Evan Brooks", contactTitle: "Owner", fit: 87, status: "review", reason: "Boutique photography company serving agents and builders.", collectedAt: iso(-1) },
    { id: "lead-4", company: "Blue Oak Getaways", type: "Airbnb Management", location: "San Antonio, TX", website: "https://example.com/blueoak", contactForm: "https://example.com/blueoak/contact", email: "", phone: "(210) 555-0108", contactName: "", contactTitle: "", fit: 81, status: "approved", reason: "Regional manager with a growing vacation-rental portfolio.", collectedAt: iso(-1) }
  ],
  companies: [
    { id: "company-1", company: "Mesa Property Media", type: "Photography", location: "Mesa, AZ", website: "https://example.com/mesa", contactForm: "https://example.com/mesa/contact", email: "", phone: "(480) 555-0122", contactName: "", contactTitle: "", stage: "Waiting for reply", attempts: 1, lastContact: iso(-5), nextTask: iso(0), reason: "Local real-estate media studio without an aerial service listed.", activities: [{ id: "a1", direction: "outbound", methodId: "primary-form", channel: "form", kind: "Contact form sent", date: iso(-5), detail: "Initial introduction submitted" }] },
    { id: "company-2", company: "Hill Country Hosts", type: "Airbnb Management", location: "Austin, TX", website: "https://example.com/hillcountry", contactForm: "https://example.com/hillcountry/contact", email: "partnerships@example.com", phone: "(512) 555-0166", contactName: "Samantha Ruiz", contactTitle: "Portfolio Manager", contactMethods: [{ id: "method-1", type: "linkedin", label: "Samantha on LinkedIn", value: "https://linkedin.com/in/example" }, { id: "method-2", type: "email", label: "General inbox", value: "hello@example.com" }], stage: "Contacted", attempts: 2, lastContact: iso(-13), nextTask: iso(-1), reason: "Manages amenity-rich properties around Austin.", activities: [{ id: "a2", direction: "outbound", methodId: "primary-email", channel: "email", kind: "Email sent", date: iso(-13), detail: "Follow-up sent to Samantha Ruiz" }, { id: "a3", direction: "outbound", methodId: "primary-form", channel: "form", kind: "Contact form sent", date: iso(-19), detail: "Initial introduction submitted" }] },
    { id: "company-3", company: "BrightFrame Real Estate", type: "Photography", location: "Houston, TX", website: "https://example.com/brightframe", contactForm: "https://example.com/brightframe/contact", email: "info@example.com", phone: "(713) 555-0144", contactName: "", contactTitle: "", stage: "New", attempts: 0, lastContact: "", nextTask: iso(0), reason: "Photography team focused on residential listings.", activities: [] },
    { id: "company-4", company: "Keys & Cactus", type: "Airbnb Management", location: "Scottsdale, AZ", website: "https://example.com/keyscactus", contactForm: "https://example.com/keyscactus/contact", email: "", phone: "(480) 555-0176", contactName: "", contactTitle: "", stage: "Interested", attempts: 2, lastContact: iso(-2), nextTask: "", reason: "Boutique manager for Scottsdale vacation homes.", activities: [{ id: "a4", direction: "inbound", kind: "Reply received", date: iso(-2), detail: "Asked to see sample imagery" }] },
    { id: "company-5", company: "Open Door Listing Media", type: "Photography", location: "Denver, CO", website: "https://example.com/opendoor", contactForm: "https://example.com/opendoor/contact", email: "team@example.com", phone: "(303) 555-0105", contactName: "Avery Stone", contactTitle: "Founder", stage: "Waiting for reply", attempts: 3, lastContact: iso(-18), nextTask: iso(2), reason: "Small founder-led media studio.", activities: [{ id: "a5", direction: "outbound", methodId: "primary-email", channel: "email", kind: "Email sent", date: iso(-18), detail: "Third outreach attempt" }, { id: "a6", direction: "outbound", methodId: "primary-email", channel: "email", kind: "Email sent", date: iso(-27), detail: "Second outreach attempt" }, { id: "a7", direction: "outbound", methodId: "primary-form", channel: "form", kind: "Contact form sent", date: iso(-34), detail: "Initial outreach" }] }
  ],
  drafts: {},
  ui: { selectedCompany: "company-1", leadFilter: "all", taskFilter: "today", crmType: "all", crmSort: "stalest", crmOutreachFilter: "all" }
});

let state;
try { state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || seed(); } catch { state = seed(); }
function normalizeState(value) {
  value ||= seed();
  value.settings ||= { attemptThreshold: 4, staleDays: 5 };
  value.settings.attemptThreshold ||= 4;
  value.settings.staleDays ||= 5;
  value.leads ||= [];
  value.companies ||= [];
  value.companies.forEach(company => { company.activities ||= []; company.contactMethods ||= []; company.contactMethodOrder ||= []; });
  value.drafts ||= {};
  value.ui ||= { selectedCompany: value.companies[0]?.id || "", leadFilter: "all", taskFilter: "today", crmType: "all" };
  value.ui.crmSort ||= "stalest";
  value.ui.crmOutreachFilter ||= "all";
  return value;
}
state = normalizeState(state);
state.settings ||= { attemptThreshold: 4, staleDays: 5, discoveryTarget: 5 };
state.settings.staleDays ||= 5;
state.drafts ||= {};
state.ui ||= { selectedCompany: state.companies[0]?.id, leadFilter: "all", taskFilter: "today", crmType: "all" };
let pendingImportRows = [];
let remoteReady = false;
let remoteSyncTimer;
let remoteSyncRunning = false;
let lastRemoteSnapshot = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const esc = (value = "") => String(value).replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
const databaseSnapshot = () => JSON.stringify({ settings: state.settings, companies: state.companies, drafts: state.drafts });
const save = () => {
  if (!REMOTE_CONFIGURED) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (remoteReady) scheduleRemoteSync();
};
const initials = name => name.split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
const prettyDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
const today = () => iso(0);
const addDays = (dateString, offset) => {
  const [year, month, calendarDay] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, calendarDay, 12);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const companyFor = task => state.companies.find(c => c.id === task.companyId);
const channelLabel = channel => ({ form: "Contact form", email: "Email", phone: "Phone", linkedin: "LinkedIn", research: "Research" }[channel] || channel);
const channelIcon = channel => ({ form: "↗", email: "✉", phone: "☎", linkedin: "in", research: "⌕" }[channel] || "•");
function allContactMethods(company, { deprioritizeWaiting = true } = {}) {
  const methods = [];
  if (company.contactForm) methods.push({ id: "primary-form", type: "form", label: "Contact form", value: company.contactForm });
  if (company.email) methods.push({ id: "primary-email", type: "email", label: company.contactName ? `${company.contactName} · Email` : "Primary email", value: company.email });
  if (company.phone) methods.push({ id: "primary-phone", type: "phone", label: company.contactName ? `${company.contactName} · Phone` : "Business phone", value: company.phone });
  (company.contactMethods || []).forEach(method => { if (method.value) methods.push({ id: method.id || uid("method"), type: method.type || "other", label: method.label || channelLabel(method.type), value: method.value }); });
  const seen = new Set();
  const unique = methods.filter(method => { const key = `${method.type}|${method.value}`.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
  const order = company.contactMethodOrder || [];
  return unique.sort((a,b) => {
    if (deprioritizeWaiting) {
      const waitingDifference = Number(isLinkedInWaiting(company, a.id)) - Number(isLinkedInWaiting(company, b.id));
      if (waitingDifference) return waitingDifference;
    }
    const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
}
function normalizedContactOrder(company) { const ids = allContactMethods({ ...company, contactMethodOrder: [] }, { deprioritizeWaiting: false }).map(method => method.id); return [...(company.contactMethodOrder || []).filter(id => ids.includes(id)), ...ids.filter(id => !(company.contactMethodOrder || []).includes(id))]; }
function moveContactMethod(company, methodId, direction) {
  const visible = allContactMethods(company);
  const visibleIndex = visible.findIndex(method => method.id === methodId);
  const targetMethod = visible[visibleIndex + direction];
  if (visibleIndex < 0 || !targetMethod || isLinkedInWaiting(company, methodId) !== isLinkedInWaiting(company, targetMethod.id)) return false;
  const order = normalizedContactOrder(company);
  const index = order.indexOf(methodId);
  const targetIndex = order.indexOf(targetMethod.id);
  if (index < 0 || targetIndex < 0) return false;
  [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
  company.contactMethodOrder = order;
  return true;
}
const contactFor = company => {
  const method = allContactMethods(company)[0];
  return method ? { ...method, channel: method.type, icon: channelIcon(method.type) } : { channel: "other", label: "Needs research", value: "No contact method", icon: "?" };
};
const typeIcon = type => type === "Photography"
  ? `<span class="company-type-icon" title="Photography company"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h3l1.4-2h7.2L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg></span>`
  : `<span class="company-type-icon management" title="Airbnb management company"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg></span>`;

const isOutboundActivity = activity => activity.direction ? activity.direction === "outbound" : (/(sent|submitted|contact form|call logged|voicemail|outreach|follow-up)/i.test(activity.kind || "") && !/reply|response/i.test(activity.kind || ""));
const isResponseActivity = activity => activity.direction ? activity.direction === "inbound" : /reply received|response received|responded/i.test(activity.kind || "");
const inactiveCompanyStages = ["Interested", "Paused", "Do not contact", "Retired"];
function isLinkedInWaiting(company, methodId) {
  const status = [...(company.activities || [])]
    .filter(activity => activity.methodId === methodId && /LinkedIn connection (pending|accepted)/i.test(activity.kind || ""))
    .sort(sortActivitiesDescending)[0];
  return /pending/i.test(status?.kind || "");
}
const activityChannel = activity => activity.channel || (/contact form/i.test(activity.kind || "") ? "form" : /email/i.test(activity.kind || "") ? "email" : /call|phone|voicemail/i.test(activity.kind || "") ? "phone" : /linkedin/i.test(activity.kind || "") ? "linkedin" : "other");
const daysBetween = (from, to = today()) => Math.floor((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / day);
const hasCompanyResponse = company => (company.activities || []).some(isResponseActivity);
const activityTieKey = activity => activity.createdAt || activity.id || "";
const sortActivitiesAscending = (a,b) => a.date.localeCompare(b.date) || activityTieKey(a).localeCompare(activityTieKey(b));
const sortActivitiesDescending = (a,b) => b.date.localeCompare(a.date) || activityTieKey(b).localeCompare(activityTieKey(a));
const ordinal = number => { const mod100 = number % 100; if (mod100 >= 11 && mod100 <= 13) return `${number}th`; return `${number}${number % 10 === 1 ? "st" : number % 10 === 2 ? "nd" : number % 10 === 3 ? "rd" : "th"}`; };
const lastOutboundDate = company => [...(company.activities || [])].filter(isOutboundActivity).sort(sortActivitiesDescending)[0]?.date || "";
function matchesOutreachAgeFilter(company, filter) {
  const lastDate = lastOutboundDate(company);
  if (filter === "never") return !lastDate;
  if (filter === "all") return true;
  const minimumDays = Number(filter.replace("days-", ""));
  return Boolean(lastDate) && daysBetween(lastDate) >= minimumDays;
}
function sortCompaniesByOutreach(companies, sort) {
  return [...companies].sort((a,b) => {
    if (sort === "name") return a.company.localeCompare(b.company);
    const aDate = lastOutboundDate(a), bDate = lastOutboundDate(b);
    if (sort === "recent") return Number(!aDate) - Number(!bDate) || bDate.localeCompare(aDate) || a.company.localeCompare(b.company);
    return Number(Boolean(aDate)) - Number(Boolean(bDate)) || aDate.localeCompare(bDate) || a.company.localeCompare(b.company);
  });
}

function outreachSequence(company) {
  const outbound = (company.activities || []).filter(isOutboundActivity).sort(sortActivitiesAscending);
  return { total: outbound.length, positions: new Map(outbound.map((activity,index) => [activity.id, index + 1])) };
}

function methodOutreachCount(company, method) {
  const sameTypeMethods = allContactMethods(company, { deprioritizeWaiting: false }).filter(item => item.type === method.type);
  return (company.activities || []).filter(activity => {
    if (!isOutboundActivity(activity)) return false;
    if (activity.methodId) return activity.methodId === method.id;
    return activityChannel(activity) === method.type && sameTypeMethods[0]?.id === method.id;
  }).length;
}

function deriveCompanyTask(company) {
  if (hasCompanyResponse(company) || inactiveCompanyStages.includes(company.stage)) return null;
  const maxPerMethod = Number(state.settings.attemptThreshold);
  const outbound = (company.activities || []).filter(isOutboundActivity).sort(sortActivitiesDescending);
  const latest = outbound[0];
  const eligible = allContactMethods(company).map((method,index) => ({ ...method, index, count: methodOutreachCount(company, method) })).filter(method => method.count < maxPerMethod && !isLinkedInWaiting(company, method.id));
  if (!eligible.length) return null;
  // CRM ranking is authoritative. History only determines attempt counts, waiting status,
  // and the follow-up date; it never overrides the highest-ranked eligible method.
  const method = eligible[0];
  let due = latest ? addDays(latest.date, Number(state.settings.staleDays)) : today();
  if (company.snoozedUntil && company.snoozedUntil > due) due = company.snoozedUntil;
  const draftKey = `${company.id}|${method.id}|${method.count + 1}`;
  const message = state.drafts[draftKey] || (outbound.length ? followupMessage(company, method.count + 1) : initialMessage(company));
  return { id: `derived-${company.id}-${method.id}`, companyId: company.id, type: outbound.length ? "followup" : "initial", channel: method.type, methodId: method.id, methodValue: method.value, methodLabel: method.label, due, status: "open", attempt: method.count + 1, totalOutreach: outbound.length, lastOutreach: latest?.date || "", draftKey, subject: method.type === "email" ? `${outbound.length ? "Quick follow-up" : "Aerial visuals"} — ${company.company}` : "", message };
}

function deriveActionTasks() {
  return state.companies.map(deriveCompanyTask).filter(Boolean).sort((a,b) => a.due.localeCompare(b.due) || a.totalOutreach - b.totalOutreach);
}

function deriveCompletedTasks() {
  return state.companies.flatMap(company => (company.activities || []).filter(isOutboundActivity).map(activity => {
    const method = allContactMethods(company).find(item => item.id === activity.methodId) || allContactMethods(company).find(item => item.type === activityChannel(activity));
    return { id: `history-${company.id}-${activity.id}`, activityId: activity.id, companyId: company.id, type: "history", channel: method?.type || activityChannel(activity), methodId: method?.id || "", methodValue: method?.value || "", methodLabel: method?.label || channelLabel(activityChannel(activity)), due: activity.date, completedAt: activity.date, status: "completed", attempt: 0, subject: activity.subject || "", message: activity.message || activity.detail || activity.kind };
  })).sort((a,b) => b.completedAt.localeCompare(a.completedAt));
}

function syncCompanyScheduleFromHistory(company) {
  const outbound = (company.activities || []).filter(isOutboundActivity).sort(sortActivitiesDescending);
  company.lastContact = outbound[0]?.date || "";
  company.attempts = outbound.length;
  const derived = deriveCompanyTask(company);
  company.nextTask = derived?.due || "";
  if (!hasCompanyResponse(company) && !inactiveCompanyStages.includes(company.stage)) company.stage = !outbound.length ? "New" : derived?.due <= today() ? "Follow-up due" : derived ? "Waiting for reply" : "Contact exhausted";
}

function notify(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function renderMetric(label, value, note, icon, good = false) {
  return `<article class="metric-card"><div class="metric-label"><span>${esc(label)}</span><span class="metric-icon">${icon}</span></div><span class="metric-value">${esc(value)}</span><span class="metric-note ${good ? "good" : ""}">${esc(note)}</span></article>`;
}

function renderShell() {
  const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  $("#todayLabel").textContent = date;
  const openToday = deriveActionTasks().filter(t => t.due <= today()).length;
  $("#taskCount").textContent = openToday;
  const completed = deriveCompletedTasks().filter(t => t.completedAt === today()).length;
  const total = completed + openToday;
  $("#dailyProgressLabel").textContent = `${completed} / ${total}`;
  $("#dailyProgressBar").style.width = `${total ? completed / total * 100 : 0}%`;
}

function renderCollection() {
  const active = state.leads.filter(l => l.status !== "imported");
  const todayLeads = active.filter(l => l.collectedAt === today()).length;
  const forms = active.filter(l => l.contactForm).length;
  const phones = active.filter(l => l.phone).length;
  $("#collectionMetrics").innerHTML = [
    renderMetric("Awaiting review", active.length, `${todayLeads} collected today`, "⌁", true),
    renderMetric("Contact forms", forms, `${Math.round(forms / Math.max(active.length,1) * 100)}% coverage`, "↗"),
    renderMetric("Phone numbers", phones, `${Math.round(phones / Math.max(active.length,1) * 100)}% coverage`, "☎"),
    renderMetric("Ready to import", active.filter(l => l.status === "approved").length, "Approved leads", "✓")
  ].join("");
  $$("#leadFilters button").forEach(b => b.classList.toggle("active", b.dataset.filter === state.ui.leadFilter));
  const query = $("#globalSearch").value.trim().toLowerCase();
  const filtered = active.filter(l => (state.ui.leadFilter === "all" || l.status === state.ui.leadFilter) && (!query || `${l.company} ${l.location} ${l.type}`.toLowerCase().includes(query)));
  $("#leadTableBody").innerHTML = filtered.length ? filtered.map(lead => {
    const contact = contactFor(lead);
    return `<tr>
      <td><input class="lead-check" type="checkbox" data-id="${lead.id}" /></td>
      <td><div class="company-cell"><span class="company-logo">${initials(lead.company)}</span><span><strong>${esc(lead.company)}</strong><small>${esc(lead.type)}</small></span></div></td>
      <td>${esc(lead.location)}</td><td><span class="contact-pill">${contact.icon} ${esc(contact.label)}</span></td>
      <td><div class="fit-score"><span class="fit-bar"><span style="width:${lead.fit}%"></span></span><strong>${lead.fit}</strong></div></td>
      <td><span class="status ${lead.status}">${lead.status}</span></td>
      <td><div class="row-actions">${lead.status !== "approved" ? `<button class="row-button approve" data-action="approve" data-id="${lead.id}">Approve</button>` : `<button class="row-button approve" data-action="import" data-id="${lead.id}">Import</button>`}<button class="row-button" data-action="remove" data-id="${lead.id}">×</button></div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="7"><div class="empty-state"><span>⌕</span><h3>No leads in this view</h3><p>Run discovery or import a CSV to add prospects.</p></div></td></tr>`;
  updateBulkBar();
}

function companyStatusClass(stage) { return stage.toLowerCase().includes("interested") ? "approved" : stage.toLowerCase().includes("new") ? "new" : "review"; }
function renderCRM() {
  const contacted = state.companies.filter(c => (c.activities || []).some(isOutboundActivity)).length;
  const replies = state.companies.filter(c => hasCompanyResponse(c) || c.stage === "Interested").length;
  const actionTasks = deriveActionTasks();
  const followups = actionTasks.filter(t => t.type === "followup" && t.due <= today()).length;
  $("#crmMetrics").innerHTML = [
    renderMetric("Companies", state.companies.length, "+ active pipeline", "▦", true),
    renderMetric("Contacted", contacted, `${Math.round(contacted / Math.max(state.companies.length,1) * 100)}% of pipeline`, "↗"),
    renderMetric("Follow-ups due", followups, `${actionTasks.filter(t => t.due < today()).length} overdue`, "◷"),
    renderMetric("Responses", replies, `${Math.round(replies / Math.max(contacted,1) * 100)}% response rate`, "✦", true)
  ].join("");
  $("#crmTypeFilter").value = state.ui.crmType;
  $("#crmSort").value = state.ui.crmSort;
  $("#crmOutreachFilter").value = state.ui.crmOutreachFilter;
  const query = $("#globalSearch").value.trim().toLowerCase();
  const companies = sortCompaniesByOutreach(state.companies.filter(c => (state.ui.crmType === "all" || c.type === state.ui.crmType) && matchesOutreachAgeFilter(c, state.ui.crmOutreachFilter) && (!query || `${c.company} ${c.location} ${c.type}`.toLowerCase().includes(query))), state.ui.crmSort);
  $("#companyList").innerHTML = companies.length ? companies.map(c => {
    const dueTask = actionTasks.find(t => t.companyId === c.id && t.due <= today());
    const statusLabel = dueTask ? (dueTask.due < today() ? "Follow-up overdue" : "Follow-up due") : c.stage;
    const outreachCount = (c.activities || []).filter(isOutboundActivity).length;
    const lastDate = lastOutboundDate(c);
    return `<button class="company-row ${c.id === state.ui.selectedCompany ? "active" : ""}" data-company-id="${c.id}">${typeIcon(c.type)}<span class="company-row-main"><strong>${esc(c.company)}</strong><small>${esc(c.location)} · ${esc(c.type)}</small></span><span class="company-row-meta"><strong class="${dueTask?.due < today() ? "overdue-label" : ""}">${esc(statusLabel)}</strong><small class="last-outreach-label">Last outreach: ${lastDate ? prettyDate(lastDate) : "Never"}</small><small>${outreachCount} outreach${outreachCount === 1 ? "" : "es"}</small></span></button>`;
  }).join("") : `<div class="empty-state"><span>▦</span><h3>No companies found</h3></div>`;
  renderCompanyDetail();
}

function renderCompanyDetail() {
  const company = state.companies.find(c => c.id === state.ui.selectedCompany);
  if (!company) { $("#companyDetail").innerHTML = `<div class="detail-empty"><div><span>▦</span>Select a company to view its CRM record.</div></div>`; return; }
  const methods = allContactMethods(company).map(method => ({ ...method, icon: channelIcon(method.type) }));
  const activities = [...(company.activities || [])].sort(sortActivitiesDescending);
  const outbound = activities.filter(isOutboundActivity);
  const sequence = outreachSequence(company);
  const derivedTask = deriveCompanyTask(company);
  const displayStage = hasCompanyResponse(company) ? "Replied" : company.stage;
  $("#companyDetail").innerHTML = `<div class="detail-head"><div><span class="status ${companyStatusClass(displayStage)}">${esc(displayStage)}</span><h2>${esc(company.company)}</h2><p>${esc(company.location)} · ${esc(company.type)}</p></div><div class="detail-actions">${hasCompanyResponse(company) || company.stage === "Interested" ? "" : `<button class="row-button approve" data-detail-action="responded">Mark responded</button>`}<button class="row-button" data-detail-action="edit">Edit</button><button class="row-button danger-row" data-detail-action="delete">Delete</button></div></div>
  <section class="detail-section"><h4>Company</h4><div class="detail-grid"><div class="detail-field"><small>Website</small><strong>${company.website ? `<a href="${esc(company.website)}" target="_blank">Open website ↗</a>` : "Not found"}</strong></div><div class="detail-field"><small>Total outreach</small><strong>${outbound.length}</strong></div><div class="detail-field"><small>Last contacted</small><strong>${prettyDate(outbound[0]?.date)}</strong></div><div class="detail-field"><small>Next eligibility</small><strong>${prettyDate(derivedTask?.due)}</strong></div></div></section>
  <section class="detail-section"><h4>Ranked contact methods</h4>${methods.length ? methods.map((m,index) => {
    const waiting = isLinkedInWaiting(company, m.id);
    const canMoveUp = index > 0 && waiting === isLinkedInWaiting(company, methods[index - 1].id);
    const canMoveDown = index < methods.length - 1 && waiting === isLinkedInWaiting(company, methods[index + 1].id);
    return `<div class="contact-method ranked ${waiting ? "method-waiting" : ""}"><span class="contact-rank">${index + 1}</span><span class="method-icon">${m.icon}</span><span class="method-copy"><strong>${esc(m.label)}</strong><small>${esc(m.value)}</small></span><span class="primary-badge ${waiting ? "waiting-badge" : ""}">${waiting ? "Waiting for connection" : `${methodOutreachCount(company, m)} / ${state.settings.attemptThreshold} used`}</span>${m.type === "linkedin" ? `<button class="row-button linkedin-state-button" data-linkedin-method="${esc(m.id)}">${waiting ? "Connection accepted" : "Waiting for connection"}</button>` : ""}<span class="rank-controls"><button class="rank-button" data-rank-method="${esc(m.id)}" data-rank-direction="-1" title="Move up" ${canMoveUp ? "" : "disabled"}>↑</button><button class="rank-button" data-rank-method="${esc(m.id)}" data-rank-direction="1" title="Move down" ${canMoveDown ? "" : "disabled"}>↓</button></span></div>`;
  }).join("") : `<p class="metric-note">No contact methods stored.</p>`}</section>
  <section class="detail-section"><h4>Fit notes</h4><p style="color:var(--muted);font-size:10px;line-height:1.55;margin:0">${esc(company.reason || "No notes yet.")}</p></section>
  <section class="detail-section"><div class="detail-section-title"><h4>History</h4><button class="row-button" data-activity-action="add" data-company-id="${company.id}">＋ Add entry</button></div>${activities.length ? activities.map(a => {
    const method = methods.find(item => item.id === a.methodId);
    const position = sequence.positions.get(a.id);
    const direction = a.direction || (isOutboundActivity(a) ? "outbound" : isResponseActivity(a) ? "inbound" : "note");
    const genericDetail = /^(initial outreach|.*outreach attempt|attempt \d+ completed)$/i.test((a.detail || "").trim());
    const metadata = [prettyDate(a.date), direction, method?.label, position ? `${ordinal(position)} outreach attempt` : "", !genericDetail ? a.detail : ""].filter(Boolean);
    const badgeClass = position ? "" : direction === "inbound" ? "inbound" : "note";
    const badgeLabel = position || (direction === "inbound" ? "↩" : "•");
    return `<div class="activity-item"><span class="activity-sequence ${badgeClass}" title="${position ? `${ordinal(position)} outreach attempt` : esc(direction)}">${badgeLabel}</span><strong>${esc(a.kind)}</strong><small>${metadata.map(esc).join(" · ")}</small><button class="activity-edit" data-activity-action="edit" data-company-id="${company.id}" data-activity-id="${a.id}">Edit</button></div>`;
  }).join("") : `<p class="metric-note">No history yet.</p>`}</section>`;
}

function openActivityDialog(companyId, activityId = "") {
  const company = state.companies.find(c => c.id === companyId); if (!company) return;
  const activity = (company.activities || []).find(a => a.id === activityId);
  const form = $("#activityForm");
  form.elements.companyId.value = companyId;
  form.elements.activityId.value = activity?.id || "";
  form.elements.kind.value = activity?.kind || "";
  form.elements.date.value = activity?.date || today();
  form.elements.direction.value = activity?.direction || (activity ? isResponseActivity(activity) ? "inbound" : isOutboundActivity(activity) ? "outbound" : "note" : "outbound");
  const methods = allContactMethods(company);
  form.elements.methodId.innerHTML = `<option value="">No specific method</option>${methods.map(method => `<option value="${esc(method.id)}" ${activity?.methodId === method.id ? "selected" : ""}>${esc(method.label)} · ${esc(method.value)}</option>`).join("")}`;
  form.elements.detail.value = activity?.detail || "";
  $("#activityDialogTitle").textContent = activity ? "Edit history entry" : "Add history entry";
  $("#deleteActivityButton").classList.toggle("hidden", !activity);
  $("#activityDialog").showModal();
}

function contactMethodRow(method = {}) {
  const types = [["form", "Contact form"], ["email", "Email"], ["phone", "Phone"], ["linkedin", "LinkedIn"], ["other", "Other"]];
  return `<div class="contact-method-row" data-method-id="${esc(method.id || uid("method"))}"><select class="method-type" aria-label="Contact method type">${types.map(([value,label]) => `<option value="${value}" ${method.type === value ? "selected" : ""}>${label}</option>`).join("")}</select><input class="method-label" value="${esc(method.label || "")}" placeholder="Label or contact name" aria-label="Contact method label" /><input class="method-value" value="${esc(method.value || "")}" placeholder="URL, email, or number" aria-label="Contact method value" /><button class="remove-method" type="button" title="Remove method">×</button></div>`;
}

function renderContactMethodRows(selector, methods = []) {
  $(selector).innerHTML = methods.length ? methods.map(contactMethodRow).join("") : `<div class="repeater-empty">No additional methods yet.</div>`;
}

function addContactMethodRow(selector) {
  const container = $(selector);
  if (container.querySelector(".repeater-empty")) container.innerHTML = "";
  container.insertAdjacentHTML("beforeend", contactMethodRow());
}

function collectContactMethods(selector) {
  return [...$(selector).querySelectorAll(".contact-method-row")].map(row => ({ id: row.dataset.methodId || uid("method"), type: row.querySelector(".method-type").value, label: row.querySelector(".method-label").value.trim(), value: row.querySelector(".method-value").value.trim() })).filter(method => method.value);
}

function renderTasks() {
  const actionTasks = deriveActionTasks();
  const completedTasks = deriveCompletedTasks();
  const openDue = actionTasks.filter(t => t.due <= today());
  const completedToday = completedTasks.filter(t => t.completedAt === today());
  const totalToday = openDue.length + completedToday.length;
  const percent = totalToday ? Math.round(completedToday.length / totalToday * 100) : 100;
  $("#completionPercent").textContent = `${percent}%`; $("#completionRing").style.setProperty("--percent", percent);
  $("#taskSummaryText").textContent = openDue.length ? `${openDue.length} outreach task${openDue.length === 1 ? "" : "s"} need your attention.` : "You’re caught up for today.";
  $("#todayTaskBadge").textContent = openDue.length;
  $("#overdueTaskBadge").textContent = openDue.filter(t => t.due < today()).length;
  $$("#taskFilters button").forEach(b => b.classList.toggle("active", b.dataset.filter === state.ui.taskFilter));
  let tasks = state.ui.taskFilter === "today" ? [...openDue, ...completedToday] : state.ui.taskFilter === "overdue" ? actionTasks.filter(t => t.due < today()) : state.ui.taskFilter === "upcoming" ? actionTasks.filter(t => t.due > today()) : completedTasks;
  tasks.sort((a,b) => state.ui.taskFilter === "completed" ? b.completedAt.localeCompare(a.completedAt) : a.due.localeCompare(b.due));
  const query = $("#globalSearch").value.trim().toLowerCase();
  tasks = tasks.filter(t => { const c = companyFor(t); return c && (!query || `${c.company} ${c.location} ${c.type}`.toLowerCase().includes(query)); });
  $("#taskList").innerHTML = tasks.length ? tasks.map(renderTaskCard).join("") : `<div class="panel empty-state"><span>✓</span><h3>Nothing here</h3><p>There are no ${esc(state.ui.taskFilter)} tasks right now.</p></div>`;
  const breakdown = ["form", "email", "phone", "linkedin", "other"].map(channel => ({ channel, count: openDue.filter(t => t.channel === channel).length })).filter(x => x.count);
  $("#focusRemaining").textContent = `${openDue.length} task${openDue.length === 1 ? "" : "s"} remaining`;
  $("#focusBreakdown").innerHTML = breakdown.length ? breakdown.map(x => `<div class="focus-row"><span>${channelIcon(x.channel)} ${channelLabel(x.channel)}</span><strong>${x.count}</strong></div>`).join("") : `<div class="focus-row"><span>All clear</span><strong>✓</strong></div>`;
}

function renderTaskCard(task) {
  const company = companyFor(task); if (!company) return "";
  const overdue = task.status === "open" && task.due < today();
  const isDone = task.status === "completed";
  const contact = task.methodValue || company.website;
  const openLabel = task.channel === "form" ? "Open form" : task.channel === "email" ? "Open email" : task.channel === "phone" ? "Call" : task.channel === "linkedin" ? "Open LinkedIn" : "Open contact";
  let href = contact || company.website || "#";
  if (task.channel === "email" && contact) href = `mailto:${contact}?subject=${encodeURIComponent(task.subject || "")}&body=${encodeURIComponent(task.message)}`;
  if (task.channel === "phone" && contact) href = `tel:${contact.replace(/[^+\d]/g, "")}`;
  return `<article class="task-card ${isDone ? "is-done" : ""}" data-task-id="${task.id}">
    <div class="task-card-main"><span class="channel-icon ${task.channel}">${channelIcon(task.channel)}</span><div class="task-info"><h3>${esc(company.company)}</h3><p>${esc(company.location)} · ${esc(task.methodLabel || channelLabel(task.channel))}${task.attempt ? ` · Method attempt ${task.attempt}` : ""}</p></div><span class="task-tag ${overdue ? "overdue" : ""}">${isDone ? "Completed" : overdue ? `${Math.max(1, daysBetween(task.due))}d overdue` : task.due === today() ? "Due today" : prettyDate(task.due)}</span></div>
    <div class="task-message">${task.subject ? `<div class="subject-line">Subject: <strong>${esc(task.subject)}</strong></div>` : ""}<div class="message-box"><textarea data-message-id="${task.id}" ${isDone ? "disabled" : ""}>${esc(task.message)}</textarea></div>
      <div class="task-actions"><div class="task-actions-main">${!isDone ? `<button class="button secondary small copy-button" data-task-action="copy" data-id="${task.id}">Copy message</button><a class="button secondary small" href="${esc(href)}" target="_blank" data-task-action="open" data-id="${task.id}" style="text-decoration:none">${openLabel} ↗</a><button class="button primary small" data-task-action="complete" data-id="${task.id}">${task.channel === "phone" ? "Log call" : "Mark as sent"} ✓</button>` : `<span class="contact-pill">✓ Completed ${prettyDate(task.completedAt)}</span>`}</div>${!isDone ? `<div class="task-actions-more">${task.channel === "linkedin" ? `<button class="row-button" data-task-action="linkedin-waiting" data-id="${task.id}">Waiting for connection</button>` : ""}<button class="row-button" data-task-action="reschedule" data-id="${task.id}">Reschedule</button><button class="row-button" data-task-action="reply" data-id="${task.id}">Mark replied</button><button class="row-button danger-row" data-task-action="retire" data-id="${task.id}">Retire prospect</button></div>` : ""}</div>
    </div></article>`;
}

function renderAll() { renderShell(); renderCollection(); renderCRM(); renderTasks(); save(); }

function switchTab(tab) {
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".page").forEach(p => p.classList.remove("active"));
  $(`#${tab}Page`).classList.add("active");
  $("#pageTitle").textContent = ({ collection: "Data collection", crm: "CRM overview", tasks: "Daily tasks" })[tab];
  $("#globalSearch").value = "";
  renderAll();
}

function updateBulkBar() {
  const selected = $$(".lead-check:checked").length;
  $("#selectedCount").textContent = selected;
  $("#bulkBar").classList.toggle("hidden", !selected);
}

function importLead(lead) {
  if (state.companies.some(c => c.company.toLowerCase() === lead.company.toLowerCase())) { notify(`${lead.company} is already in the CRM`); return false; }
  const company = { ...lead, id: uid("company"), stage: "New", attempts: 0, lastContact: "", nextTask: today(), activities: [] };
  delete company.status; delete company.collectedAt; delete company.fit;
  state.companies.unshift(company); lead.status = "imported";
  state.ui.selectedCompany = company.id;
  return true;
}

function initialMessage(company) {
  const greeting = company.contactName ? `Hi ${company.contactName.split(" ")[0]},` : `Hi ${company.company} team,`;
  const audience = company.type === "Photography" ? "real-estate photographers offer aerial-style imagery without coordinating a drone pilot" : "short-term rental managers showcase their properties and nearby amenities from a new perspective";
  return `${greeting}\n\nI’m a USC business student building a fast way to help ${audience}. My AI-powered renders and proximity maps can be created at a fraction of the usual time and cost.\n\nI’d love to make a free sample for one of your properties. Would that be useful?\n\nBest,\nCarson`;
}

function followupMessage(company, attempt) {
  const greeting = company.contactName ? `Hi ${company.contactName.split(" ")[0]},` : `Hi ${company.company} team,`;
  if (attempt >= 4) return `${greeting}\n\nOne last note from me. I’d still be glad to create a no-cost aerial-style sample for one of your properties. If it isn’t relevant right now, no worries at all.\n\nBest,\nCarson`;
  return `${greeting}\n\nJust following up in case my earlier note got buried. I create AI-powered aerial renders and proximity maps that help showcase a property and its surroundings at a glance.\n\nWould it be useful if I made a free sample for you?\n\nBest,\nCarson`;
}

function completeTask(id) {
  const task = deriveActionTasks().find(item => item.id === id); const company = task && companyFor(task); if (!task || !company) return;
  const textarea = $(`textarea[data-message-id="${id}"]`); if (textarea) task.message = textarea.value;
  company.activities ||= [];
  company.activities.unshift({ id: uid("activity"), createdAt: new Date().toISOString(), direction: "outbound", methodId: task.methodId, methodValue: task.methodValue, methodLabel: task.methodLabel, channel: task.channel, kind: task.channel === "phone" ? "Call logged" : `${channelLabel(task.channel)} sent`, date: today(), subject: task.subject, message: task.message, detail: `${task.methodLabel} · Method attempt ${task.attempt}` });
  delete state.drafts[task.draftKey]; company.snoozedUntil = ""; syncCompanyScheduleFromHistory(company);
  notify(task.channel === "phone" ? "Call added to CRM history" : "Outreach added to CRM history"); renderAll();
}

function markReplied(id) {
  const task = deriveActionTasks().find(item => item.id === id); const company = task && companyFor(task); if (!task || !company) return;
  markCompanyResponded(company.id);
}

function markCompanyResponded(companyId) {
  const company = state.companies.find(c => c.id === companyId); if (!company) return;
  company.activities ||= [];
  company.activities.unshift({ id: uid("activity"), createdAt: new Date().toISOString(), direction: "inbound", kind: "Reply received", date: today(), detail: "Company responded; excluded from the task query" });
  syncCompanyScheduleFromHistory(company);
  notify("Reply added to CRM history"); renderAll();
}

function setLinkedInConnectionState(company, methodId, waiting) {
  const method = allContactMethods(company, { deprioritizeWaiting: false }).find(item => item.id === methodId);
  if (!method || method.type !== "linkedin") return;
  company.activities ||= [];
  company.activities.unshift({
    id: uid("activity"), createdAt: new Date().toISOString(), direction: "note",
    methodId: method.id, methodValue: method.value, methodLabel: method.label, channel: "linkedin",
    kind: waiting ? "LinkedIn connection pending" : "LinkedIn connection accepted",
    date: today(), detail: waiting ? "Waiting for the connection request to be accepted; this method is temporarily excluded from tasks." : "Connection accepted; this method is eligible for outreach again."
  });
  syncCompanyScheduleFromHistory(company);
  notify(waiting ? "LinkedIn method moved to the bottom while you wait" : "LinkedIn method is active again");
  renderAll();
}

function retireProspect(company) {
  if (!company || !window.confirm(`Retire ${company.company}? It will leave the task list, but its CRM record and history will remain.`)) return;
  company.stage = "Retired";
  company.snoozedUntil = "";
  company.activities ||= [];
  company.activities.unshift({ id: uid("activity"), createdAt: new Date().toISOString(), direction: "note", kind: "Prospect retired", date: today(), detail: "Removed from active outreach manually" });
  syncCompanyScheduleFromHistory(company);
  notify(`${company.company} retired`);
  renderAll();
}

function parseCSV(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"' && quoted && text[i+1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = !quoted; else if (c === "," && !quoted) { row.push(cell.trim()); cell = ""; } else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i+1] === "\n") i++; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; } else cell += c; }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const get = (r, names) => { const idx = headers.findIndex(h => names.includes(h)); return idx >= 0 ? r[idx] || "" : ""; };
  return rows.slice(1).map(r => {
    const rawType = get(r,["type","companytype","segment"]);
    const contactMethods = [];
    const linkedin = get(r,["linkedin","linkedinurl"]); if (linkedin) contactMethods.push({ id: uid("method"), type: "linkedin", label: get(r,["linkedinlabel"]) || "LinkedIn", value: linkedin });
    for (let index = 1; index <= 3; index++) { const value = get(r,[`additionalcontactvalue${index}`,`contactvalue${index}`]); if (value) contactMethods.push({ id: uid("method"), type: (get(r,[`additionalcontacttype${index}`,`contacttype${index}`]) || "other").toLowerCase().replace("contact form","form"), label: get(r,[`additionalcontactlabel${index}`,`contactlabel${index}`]) || `Additional contact ${index}`, value }); }
    return { id: uid("lead"), company: get(r,["company","companyname","name"]), type: /airbnb|vacation|property management/i.test(rawType) ? "Airbnb Management" : "Photography", location: get(r,["location","market","citystate"]), website: get(r,["website","url"]), contactForm: get(r,["contactform","contactformurl","form"]), email: get(r,["primaryemail","email","emailaddress"]), phone: get(r,["primaryphone","phone","phonenumber"]), contactName: get(r,["contact","contactname"]), contactTitle: get(r,["title","contacttitle","role"]), contactMethods, fit: Number(get(r,["fit","fitscore"])) || 75, status: "new", reason: get(r,["fitnotes","reason","notes","fitreason"]) || "Imported from spreadsheet.", sourceUrl: get(r,["sourceurl","source"]), collectedAt: today() };
  }).filter(lead => lead.company);
}

function websiteDomain(value) {
  if (!value) return "";
  try { const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); return url.hostname.toLowerCase().replace(/^www\./, "").replace(/\.$/, ""); } catch { return ""; }
}

function setStorageStatus(label, mode = "") {
  const badge = $("#storageStatus");
  if (!badge) return;
  badge.textContent = label;
  badge.className = `storage-status ${mode}`.trim();
}

function scheduleRemoteSync(delay = 650) {
  if (!remoteReady || !REMOTE_CONFIGURED) return;
  clearTimeout(remoteSyncTimer);
  remoteSyncTimer = setTimeout(flushRemoteSync, delay);
}

async function flushRemoteSync() {
  if (!remoteReady || remoteSyncRunning) return;
  const snapshot = databaseSnapshot();
  if (snapshot === lastRemoteSnapshot) return;
  remoteSyncRunning = true;
  let synced = false;
  setStorageStatus("Saving…", "syncing");
  try {
    await remoteStorage.syncState(state, websiteDomain);
    lastRemoteSnapshot = snapshot;
    synced = true;
    setStorageStatus("Supabase saved");
  } catch (error) {
    console.error(error);
    setStorageStatus("Save failed", "error");
    notify(`Supabase save failed: ${error.message || error}`);
  } finally {
    remoteSyncRunning = false;
    if (synced && databaseSnapshot() !== lastRemoteSnapshot) scheduleRemoteSync(250);
  }
}

async function connectSupabase() {
  setStorageStatus("Loading…", "syncing");
  const localState = state;
  const remoteState = normalizeState(await remoteStorage.loadState());
  const shouldMigrateLocal = !remoteState.companies.length && localState.companies.length && window.confirm("Your Supabase CRM is empty. Copy the companies currently stored in this browser into Supabase?");
  state = shouldMigrateLocal ? normalizeState(localState) : remoteState;
  remoteReady = true;
  if (shouldMigrateLocal) {
    lastRemoteSnapshot = "";
    await flushRemoteSync();
  } else {
    lastRemoteSnapshot = databaseSnapshot();
    setStorageStatus("Supabase saved");
  }
  localStorage.removeItem(STORAGE_KEY);
  $("#signOutButton").classList.remove("hidden");
  if ($("#authDialog").open) $("#authDialog").close();
  renderAll();
}

async function initializePersistence() {
  if (!REMOTE_CONFIGURED) { setStorageStatus("Local only", "local"); return; }
  setStorageStatus("Connecting…", "syncing");
  try {
    const session = await remoteStorage.getSession();
    if (!session) { $("#authDialog").showModal(); setStorageStatus("Sign in", "syncing"); return; }
    await connectSupabase();
  } catch (error) {
    console.error(error);
    $("#authError").textContent = error.message || String(error);
    $("#authError").classList.remove("hidden");
    if (!$("#authDialog").open) $("#authDialog").showModal();
    setStorageStatus("Connection failed", "error");
  }
}

function prepareImportPreview(leads) {
  const existingDomains = new Map(state.companies.map(company => [websiteDomain(company.website), company.company]).filter(([domain]) => domain));
  const seen = new Map();
  pendingImportRows = leads.map((lead,index) => {
    const domain = websiteDomain(lead.website);
    const duplicateOf = domain ? existingDomains.get(domain) || seen.get(domain) || "" : "";
    if (domain && !seen.has(domain)) seen.set(domain, lead.company);
    return { index, lead, domain, duplicateOf, include: !duplicateOf };
  });
  renderImportPreview();
  $("#importPreviewDialog").showModal();
}

function renderImportPreview() {
  const duplicates = pendingImportRows.filter(row => row.duplicateOf).length;
  $("#importSummary").textContent = `${pendingImportRows.length} spreadsheet row${pendingImportRows.length === 1 ? "" : "s"} · ${duplicates} duplicate domain${duplicates === 1 ? "" : "s"} flagged`;
  $("#importPreviewBody").innerHTML = pendingImportRows.length ? pendingImportRows.map(row => `<tr class="${row.duplicateOf ? "duplicate-row" : ""}"><td><input class="import-row-check" type="checkbox" data-import-index="${row.index}" ${row.include ? "checked" : ""} /></td><td><strong>${esc(row.lead.company)}</strong></td><td>${esc(row.lead.type)}</td><td>${esc(row.lead.location || "—")}</td><td><span class="domain-text">${esc(row.domain || "No website domain")}</span></td><td>${allContactMethods(row.lead).length}</td><td>${row.duplicateOf ? `<span class="duplicate-flag">Matches ${esc(row.duplicateOf)}</span>` : `<span class="new-flag">New record</span>`}</td></tr>`).join("") : `<tr><td colspan="7"><div class="empty-state"><h3>No valid company rows found</h3></div></td></tr>`;
}

function createCompanyFromImport(lead) {
  const company = { ...lead, id: uid("company"), stage: "New", attempts: 0, lastContact: "", nextTask: today(), activities: [], contactMethodOrder: [] };
  delete company.status; delete company.collectedAt; delete company.fit;
  company.contactMethodOrder = normalizedContactOrder(company);
  state.companies.unshift(company);
  return company;
}

function deleteCompanyRecord(companyId) {
  const index = state.companies.findIndex(company => company.id === companyId);
  if (index < 0) return false;
  state.companies.splice(index, 1);
  Object.keys(state.drafts).filter(key => key.startsWith(`${companyId}|`)).forEach(key => delete state.drafts[key]);
  state.ui.selectedCompany = state.companies[index]?.id || state.companies[index - 1]?.id || state.companies[0]?.id || "";
  return true;
}

const SIDEBAR_STORAGE_KEY = "relay-sidebar-collapsed";
function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  const button = $("#sidebarToggle");
  button.setAttribute("aria-expanded", String(!collapsed));
  button.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  button.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
  try { localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "1" : "0"); } catch {}
}
try { setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1"); } catch { setSidebarCollapsed(false); }

// Navigation and filters
$("#sidebarToggle").addEventListener("click", () => setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
$$('.nav-item').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
$("#analyticsButton").addEventListener("click", () => {
  switchTab("crm");
  $("#crmMetrics").scrollIntoView({ behavior: "smooth", block: "start" });
  $$("#crmMetrics .metric-card").forEach(card => { card.classList.add("analytics-highlight"); setTimeout(() => card.classList.remove("analytics-highlight"), 1200); });
});
$("#leadFilters").addEventListener("click", e => { if (!e.target.dataset.filter) return; state.ui.leadFilter = e.target.dataset.filter; renderCollection(); save(); });
$("#taskFilters").addEventListener("click", e => { const button = e.target.closest("button"); if (!button) return; state.ui.taskFilter = button.dataset.filter; renderTasks(); save(); });
$("#crmTypeFilter").addEventListener("change", e => { state.ui.crmType = e.target.value; renderCRM(); save(); });
$("#crmSort").addEventListener("change", e => { state.ui.crmSort = e.target.value; renderCRM(); save(); });
$("#crmOutreachFilter").addEventListener("change", e => { state.ui.crmOutreachFilter = e.target.value; renderCRM(); save(); });
$("#globalSearch").addEventListener("input", () => { renderCollection(); renderCRM(); renderTasks(); });

// Lead collection actions
function openLeadDialog() { $("#leadForm").reset(); renderContactMethodRows("#leadContactMethods", []); $("#leadDialog").showModal(); }
$("#addLeadButton").addEventListener("click", openLeadDialog);
$("#crmAddButton").addEventListener("click", openLeadDialog);
$("#addLeadContactMethod").addEventListener("click", () => addContactMethodRow("#leadContactMethods"));
$("#addCompanyContactMethod").addEventListener("click", () => addContactMethodRow("#companyContactMethods"));
[["#leadContactMethods"], ["#companyContactMethods"]].forEach(([selector]) => $(selector).addEventListener("click", e => { const button = e.target.closest(".remove-method"); if (!button) return; button.closest(".contact-method-row").remove(); if (!$(selector).querySelector(".contact-method-row")) renderContactMethodRows(selector, []); }));
$("#uploadButton").addEventListener("click", () => $("#csvInput").click());
$("#crmImportButton").addEventListener("click", () => $("#csvInput").click());
$("#csvInput").addEventListener("change", async e => { const file = e.target.files[0]; if (!file) return; const rows = parseCSV(await file.text()); e.target.value = ""; prepareImportPreview(rows); });
$("#importPreviewBody").addEventListener("change", e => { if (!e.target.classList.contains("import-row-check")) return; const row = pendingImportRows.find(item => item.index === Number(e.target.dataset.importIndex)); if (row) row.include = e.target.checked; });
$("#importSelectedButton").addEventListener("click", () => { const selected = pendingImportRows.filter(row => row.include); let latest; selected.forEach(row => latest = createCompanyFromImport(row.lead)); if (latest) state.ui.selectedCompany = latest.id; $("#importPreviewDialog").close(); pendingImportRows = []; notify(`${selected.length} CRM record${selected.length === 1 ? "" : "s"} created`); renderAll(); });
$("#leadForm").addEventListener("submit", e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); if (!data.company || !data.location) return; data.contactMethods = collectContactMethods("#leadContactMethods"); const company = createCompanyFromImport({ ...data, reason: "Added manually." }); state.ui.selectedCompany = company.id; e.currentTarget.reset(); $("#leadDialog").close(); notify("Company added to the CRM"); renderAll(); });
$("#leadTableBody").addEventListener("click", e => { const button = e.target.closest("button"); if (!button) return; const lead = state.leads.find(l => l.id === button.dataset.id); if (!lead) return; if (button.dataset.action === "approve") { lead.status = "approved"; notify("Lead approved — ready to import"); } if (button.dataset.action === "import") { if (importLead(lead)) notify(`${lead.company} added to the CRM`); } if (button.dataset.action === "remove") { state.leads = state.leads.filter(l => l.id !== lead.id); notify("Lead removed"); } renderAll(); });
$("#leadTableBody").addEventListener("change", e => { if (e.target.classList.contains("lead-check")) updateBulkBar(); });
$("#selectAllLeads").addEventListener("change", e => { $$(".lead-check").forEach(c => c.checked = e.target.checked); updateBulkBar(); });
$("#bulkImportButton").addEventListener("click", () => { const ids = $$(".lead-check:checked").map(c => c.dataset.id); let count = 0; ids.forEach(id => { const lead = state.leads.find(l => l.id === id); if (lead && importLead(lead)) count++; }); notify(`${count} lead${count === 1 ? "" : "s"} added to the CRM`); renderAll(); });

// CRM and task actions
$("#companyList").addEventListener("click", e => { const row = e.target.closest("[data-company-id]"); if (!row) return; state.ui.selectedCompany = row.dataset.companyId; renderCRM(); save(); });
$("#companyDetail").addEventListener("click", e => {
  const linkedinButton = e.target.closest("[data-linkedin-method]");
  if (linkedinButton) { const company = state.companies.find(c => c.id === state.ui.selectedCompany); if (!company) return; setLinkedInConnectionState(company, linkedinButton.dataset.linkedinMethod, !isLinkedInWaiting(company, linkedinButton.dataset.linkedinMethod)); return; }
  const rankButton = e.target.closest("[data-rank-method]");
  if (rankButton) { const company = state.companies.find(c => c.id === state.ui.selectedCompany); if (!company) return; if (moveContactMethod(company, rankButton.dataset.rankMethod, Number(rankButton.dataset.rankDirection))) { notify("Contact-method ranking updated"); renderAll(); } return; }
  const activityAction = e.target.closest("[data-activity-action]");
  if (activityAction) { openActivityDialog(activityAction.dataset.companyId, activityAction.dataset.activityId || ""); return; }
  const action = e.target.closest("[data-detail-action]")?.dataset.detailAction;
  const company = state.companies.find(c => c.id === state.ui.selectedCompany); if (!action || !company) return;
  if (action === "responded") { markCompanyResponded(company.id); return; }
  if (action === "delete") {
    if (!window.confirm(`Delete ${company.company}? This permanently removes its contact methods and complete outreach history from this browser.`)) return;
    if (deleteCompanyRecord(company.id)) { notify(`${company.company} deleted`); renderAll(); }
    return;
  }
  if (action === "edit") {
    const form = $("#editCompanyForm");
    ["id", "company", "type", "stage", "location", "website", "contactForm", "email", "phone", "contactName", "contactTitle", "reason"].forEach(field => { form.elements[field].value = company[field] || ""; });
    renderContactMethodRows("#companyContactMethods", company.contactMethods || []);
    $("#editCompanyDialog").showModal(); return;
  }
});
$("#editCompanyForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));
  const company = state.companies.find(c => c.id === data.id); if (!company) return;
  ["company", "type", "stage", "location", "website", "contactForm", "email", "phone", "contactName", "contactTitle", "reason"].forEach(field => company[field] = data[field]?.trim() || "");
  company.contactMethods = collectContactMethods("#companyContactMethods");
  company.contactMethodOrder = normalizedContactOrder(company);
  company.activities ||= []; company.activities.unshift({ id: uid("activity"), createdAt: new Date().toISOString(), direction: "note", kind: "CRM record updated", date: today(), detail: "Company or contact details edited" });
  $("#editCompanyDialog").close(); notify("Company details updated"); renderAll();
});
$("#activityForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));
  const company = state.companies.find(c => c.id === data.companyId); if (!company) return;
  company.activities ||= [];
  const method = allContactMethods(company).find(item => item.id === data.methodId);
  const activity = company.activities.find(a => a.id === data.activityId);
  if (activity) { activity.kind = data.kind.trim(); activity.date = data.date; activity.direction = data.direction; activity.methodId = data.methodId; activity.channel = method?.type || "other"; activity.methodValue = method?.value || ""; activity.detail = data.detail.trim(); }
  else company.activities.unshift({ id: uid("activity"), createdAt: new Date().toISOString(), kind: data.kind.trim(), date: data.date, direction: data.direction, methodId: data.methodId, channel: method?.type || "other", methodValue: method?.value || "", detail: data.detail.trim() });
  syncCompanyScheduleFromHistory(company);
  $("#activityDialog").close(); notify(activity ? "History entry updated" : "History entry added"); renderAll();
});
$("#deleteActivityButton").addEventListener("click", () => {
  const form = $("#activityForm");
  const company = state.companies.find(c => c.id === form.elements.companyId.value); if (!company) return;
  if (!window.confirm("Delete this history entry?")) return;
  company.activities = (company.activities || []).filter(a => a.id !== form.elements.activityId.value);
  syncCompanyScheduleFromHistory(company);
  $("#activityDialog").close(); notify("History entry deleted"); renderAll();
});
$("#taskList").addEventListener("input", e => { if (!e.target.dataset.messageId) return; const task = deriveActionTasks().find(item => item.id === e.target.dataset.messageId); if (task) { state.drafts[task.draftKey] = e.target.value; save(); } });
$("#taskList").addEventListener("click", async e => {
  const button = e.target.closest("[data-task-action]"); if (!button) return;
  const id = button.dataset.id; const task = deriveActionTasks().find(item => item.id === id); if (!task) return;
  if (button.dataset.taskAction === "copy") { const textarea = $(`textarea[data-message-id="${id}"]`); try { await navigator.clipboard.writeText(textarea.value); button.textContent = "Copied ✓"; setTimeout(() => button.textContent = "Copy message", 1300); } catch { textarea.select(); document.execCommand("copy"); notify("Message copied"); } }
  else if (button.dataset.taskAction === "complete") completeTask(id);
  else if (button.dataset.taskAction === "reply") markReplied(id);
  else if (button.dataset.taskAction === "linkedin-waiting") { const company = companyFor(task); setLinkedInConnectionState(company, task.methodId, true); }
  else if (button.dataset.taskAction === "reschedule") { const company = companyFor(task); company.snoozedUntil = iso(2); notify("Company snoozed for two days"); renderAll(); }
  else if (button.dataset.taskAction === "retire") retireProspect(companyFor(task));
});

// Settings
$("#settingsButton").addEventListener("click", () => { $("#attemptThreshold").value = state.settings.attemptThreshold; $("#staleDays").value = state.settings.staleDays; $("#settingsDialog").showModal(); });
$("#saveSettingsButton").addEventListener("click", e => { e.preventDefault(); state.settings.attemptThreshold = Number($("#attemptThreshold").value); state.settings.staleDays = Number($("#staleDays").value); state.companies.forEach(syncCompanyScheduleFromHistory); $("#settingsDialog").close(); notify("Task query settings updated"); renderAll(); });
$("#authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const button = $("#authSubmitButton");
  const errorBox = $("#authError");
  const data = Object.fromEntries(new FormData(e.currentTarget));
  button.disabled = true; button.textContent = "Signing in…"; errorBox.classList.add("hidden");
  try { await remoteStorage.signIn(data.email.trim(), data.password); await connectSupabase(); }
  catch (error) { errorBox.textContent = error.message || String(error); errorBox.classList.remove("hidden"); setStorageStatus("Sign-in failed", "error"); }
  finally { button.disabled = false; button.textContent = "Sign in"; }
});
$("#signOutButton").addEventListener("click", async () => {
  if (!window.confirm("Sign out of Relay on this device?")) return;
  if (remoteReady) await flushRemoteSync();
  await remoteStorage.signOut();
  remoteReady = false; lastRemoteSnapshot = ""; localStorage.removeItem(STORAGE_KEY);
  state = normalizeState(seed());
  $("#settingsDialog").close(); $("#signOutButton").classList.add("hidden");
  renderAll(); setStorageStatus("Sign in", "syncing"); $("#authDialog").showModal();
});
$$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.closeDialog}`).close()));

renderAll();
initializePersistence();
