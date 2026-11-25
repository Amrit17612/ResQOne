const DRAFT_KEY = 'resqone_offline_incident_drafts';

export const getOfflineDrafts = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveOfflineDraft = (draft) => {
  const drafts = getOfflineDrafts();
  const newDraft = {
    ...draft,
    id: `draft_${Date.now()}`,
    savedAt: new Date().toISOString(),
    status: 'SAVED_OFFLINE'
  };
  drafts.unshift(newDraft);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  return newDraft;
};

export const removeOfflineDraft = (id) => {
  const drafts = getOfflineDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
};

