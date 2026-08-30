(function () {
  const config = window.RELAY_SUPABASE || {};
  const configured = Boolean(
    config.projectUrl && config.publishableKey &&
    !config.projectUrl.includes("YOUR_SUPABASE") &&
    !config.publishableKey.includes("YOUR_SUPABASE")
  );
  let client = null;
  let user = null;

  const assertResult = result => {
    if (result.error) throw result.error;
    return result.data;
  };

  function init() {
    if (!configured) return null;
    if (!window.supabase?.createClient) throw new Error("Supabase client library failed to load.");
    client ||= window.supabase.createClient(config.projectUrl, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  async function getSession() {
    init();
    const data = assertResult(await client.auth.getSession());
    user = data.session?.user || null;
    return data.session || null;
  }

  async function signIn(email, password) {
    init();
    const data = assertResult(await client.auth.signInWithPassword({ email, password }));
    user = data.user;
    return data;
  }

  async function signOut() {
    if (!client) return;
    assertResult(await client.auth.signOut());
    user = null;
  }

  function requireUser() {
    if (!user) throw new Error("You must be signed in to access the CRM database.");
    return user;
  }

  async function loadState() {
    const activeUser = requireUser();
    const ownerId = activeUser.id;
    const [companies, methods, activities, settings, drafts] = await Promise.all([
      client.from("companies").select("*").eq("owner_id", ownerId).order("created_at", { ascending: true }),
      client.from("contact_methods").select("*").eq("owner_id", ownerId).order("rank", { ascending: true }),
      client.from("activities").select("*").eq("owner_id", ownerId).order("activity_date", { ascending: false }),
      client.from("user_settings").select("*").eq("user_id", ownerId).maybeSingle(),
      client.from("message_drafts").select("*").eq("owner_id", ownerId)
    ].map(async request => assertResult(await request)));

    const methodsByCompany = new Map();
    methods.forEach(row => {
      const list = methodsByCompany.get(row.company_id) || [];
      list.push({ id: row.id, type: row.method_type, label: row.label, value: row.value });
      methodsByCompany.set(row.company_id, list);
    });
    const activitiesByCompany = new Map();
    activities.forEach(row => {
      const list = activitiesByCompany.get(row.company_id) || [];
      list.push({
        id: row.id, createdAt: row.created_at, direction: row.direction,
        methodId: row.method_id || "", methodValue: row.method_value,
        methodLabel: row.method_label, channel: row.channel, kind: row.kind,
        date: row.activity_date, subject: row.subject, message: row.message, detail: row.detail
      });
      activitiesByCompany.set(row.company_id, list);
    });

    const companyState = companies.map(row => ({
      id: row.id, company: row.company_name, type: row.company_type, location: row.location,
      website: row.website, contactForm: row.contact_form, email: row.primary_email,
      phone: row.primary_phone, contactName: row.contact_name, contactTitle: row.contact_title,
      stage: row.stage, reason: row.fit_notes, sourceUrl: row.source_url,
      snoozedUntil: row.snoozed_until || "", contactMethodOrder: row.contact_method_order || [],
      contactMethods: methodsByCompany.get(row.id) || [], activities: activitiesByCompany.get(row.id) || []
    }));
    return {
      settings: {
        attemptThreshold: settings?.attempt_threshold || 4,
        staleDays: settings?.stale_days || 5
      },
      leads: [], companies: companyState,
      drafts: Object.fromEntries(drafts.map(row => [row.draft_key, row.body])),
      ui: { selectedCompany: companyState[0]?.id || "", leadFilter: "all", taskFilter: "today", crmType: "all" }
    };
  }

  async function syncState(state, domainForWebsite) {
    const activeUser = requireUser();
    const ownerId = activeUser.id;
    const companyRows = state.companies.map(company => ({
      owner_id: ownerId, id: company.id, company_name: company.company,
      company_type: company.type, location: company.location || "", website: company.website || "",
      website_domain: domainForWebsite(company.website), contact_form: company.contactForm || "",
      primary_email: company.email || "", primary_phone: company.phone || "",
      contact_name: company.contactName || "", contact_title: company.contactTitle || "",
      stage: company.stage || "New", fit_notes: company.reason || "", source_url: company.sourceUrl || "",
      snoozed_until: company.snoozedUntil || null, contact_method_order: company.contactMethodOrder || []
    }));
    if (companyRows.length) assertResult(await client.from("companies").upsert(companyRows, { onConflict: "owner_id,id" }));

    const remoteCompanies = assertResult(await client.from("companies").select("id").eq("owner_id", ownerId));
    const companyIds = new Set(companyRows.map(row => row.id));
    const removedCompanyIds = remoteCompanies.map(row => row.id).filter(id => !companyIds.has(id));
    if (removedCompanyIds.length) assertResult(await client.from("companies").delete().eq("owner_id", ownerId).in("id", removedCompanyIds));

    const methodRows = state.companies.flatMap(company => (company.contactMethods || []).map((method, index) => ({
      owner_id: ownerId, id: method.id, company_id: company.id, method_type: method.type || "other",
      label: method.label || "", value: method.value, rank: index
    })));
    if (methodRows.length) assertResult(await client.from("contact_methods").upsert(methodRows, { onConflict: "owner_id,id" }));
    const remoteMethods = assertResult(await client.from("contact_methods").select("id").eq("owner_id", ownerId));
    const methodIds = new Set(methodRows.map(row => row.id));
    const removedMethodIds = remoteMethods.map(row => row.id).filter(id => !methodIds.has(id));
    if (removedMethodIds.length) assertResult(await client.from("contact_methods").delete().eq("owner_id", ownerId).in("id", removedMethodIds));

    const activityRows = state.companies.flatMap(company => (company.activities || []).map(activity => {
      const inferredDirection = /(sent|submitted|contact form|call logged|voicemail|outreach|follow-up)/i.test(activity.kind || "") && !/reply|response/i.test(activity.kind || "") ? "outbound" : /reply|response/i.test(activity.kind || "") ? "inbound" : "note";
      const inferredChannel = /contact form/i.test(activity.kind || "") ? "form" : /email/i.test(activity.kind || "") ? "email" : /call|phone|voicemail/i.test(activity.kind || "") ? "phone" : /linkedin/i.test(activity.kind || "") ? "linkedin" : "other";
      return {
        owner_id: ownerId, id: activity.id, company_id: company.id,
        direction: activity.direction || inferredDirection, method_id: activity.methodId || null,
        method_value: activity.methodValue || "", method_label: activity.methodLabel || "",
        channel: activity.channel || inferredChannel, kind: activity.kind || "CRM activity",
        activity_date: activity.date, subject: activity.subject || "", message: activity.message || "",
        detail: activity.detail || "", created_at: activity.createdAt || new Date(`${activity.date}T12:00:00`).toISOString()
      };
    }));
    if (activityRows.length) assertResult(await client.from("activities").upsert(activityRows, { onConflict: "owner_id,id" }));
    const remoteActivities = assertResult(await client.from("activities").select("id").eq("owner_id", ownerId));
    const activityIds = new Set(activityRows.map(row => row.id));
    const removedActivityIds = remoteActivities.map(row => row.id).filter(id => !activityIds.has(id));
    if (removedActivityIds.length) assertResult(await client.from("activities").delete().eq("owner_id", ownerId).in("id", removedActivityIds));

    const draftRows = Object.entries(state.drafts || {}).map(([draftKey, body]) => ({ owner_id: ownerId, draft_key: draftKey, body }));
    if (draftRows.length) assertResult(await client.from("message_drafts").upsert(draftRows, { onConflict: "owner_id,draft_key" }));
    const remoteDrafts = assertResult(await client.from("message_drafts").select("draft_key").eq("owner_id", ownerId));
    const draftKeys = new Set(draftRows.map(row => row.draft_key));
    const removedDraftKeys = remoteDrafts.map(row => row.draft_key).filter(key => !draftKeys.has(key));
    if (removedDraftKeys.length) assertResult(await client.from("message_drafts").delete().eq("owner_id", ownerId).in("draft_key", removedDraftKeys));

    assertResult(await client.from("user_settings").upsert({
      user_id: ownerId,
      attempt_threshold: Number(state.settings.attemptThreshold),
      stale_days: Number(state.settings.staleDays)
    }, { onConflict: "user_id" }));
  }

  window.RelaySupabaseStorage = { configured, init, getSession, signIn, signOut, loadState, syncState };
})();
