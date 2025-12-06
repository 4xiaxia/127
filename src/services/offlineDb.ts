
export interface DraftSubmission {
  _id: string;
  name: string;
  type: string;
  desc: string;
  location_desc: string;
  recommender_name: string;
  createdAt: number;
  imagePreviewUrl?: string; 
}

const STORAGE_KEY = 'village_guide_drafts';

const getStorage = (): DraftSubmission[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        // Failed to parse drafts
        return [];
    }
}

const setStorage = (drafts: DraftSubmission[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch (e) {
        // Failed to save drafts (Quota exceeded?)
        alert("本地存储空间已满，无法保存更多带图草稿。请尝试删除旧草稿。");
        throw e;
    }
}

// Updated to accept an optional processedBase64 string directly
export const saveDraft = async (
    data: Omit<DraftSubmission, '_id' | 'createdAt'>, 
    imageFile?: File,
    processedBase64?: string
): Promise<any> => {
  const drafts = getStorage();
  
  let imagePreviewUrl: string | undefined = processedBase64;

  // If a raw file is provided but no processed string, we process it basically here (fallback)
  if (!imagePreviewUrl && imageFile) {
      try {
          imagePreviewUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(imageFile);
          });
      } catch (e) {
          // Image conversion failed
      }
  }

  const newDraft: DraftSubmission = {
    _id: new Date().toISOString(),
    ...data,
    imagePreviewUrl,
    createdAt: Date.now(),
  };

  drafts.push(newDraft);
  setStorage(drafts);
  return { ok: true, id: newDraft._id };
};

export const getDrafts = async (): Promise<DraftSubmission[]> => {
  return getStorage();
};

export const deleteDraft = async (doc: DraftSubmission) => {
    const drafts = getStorage();
    const filtered = drafts.filter(d => d._id !== doc._id);
    setStorage(filtered);
    return { ok: true };
}
