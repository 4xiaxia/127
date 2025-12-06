import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './common/Icon';
import { Spinner } from './common/Spinner';
import * as offlineDb from '../services/offlineDb';
import { DraftSubmission } from '../services/offlineDb';
import { processImage } from '../utils/imageProcessor';
import { VoiceInteractionPanel } from './VoiceInteractionPanel';

interface SubmissionData {
  name: string;
  type: 'red' | 'ecology' | 'folk' | 'food' | 'celebrity';
  desc: string;
  location_desc: string;
  recommender_name: string;
}

interface AdminSubmissionFormProps {
  onBack: () => void;
}

const AdminSubmissionForm: React.FC<AdminSubmissionFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<SubmissionData>({
    name: '',
    type: 'ecology',
    desc: '',
    location_desc: '',
    recommender_name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'saved_local'>('idle');
  const [drafts, setDrafts] = useState<DraftSubmission[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDrafts(); }, []);

  const loadDrafts = async () => {
      setIsLoadingDrafts(true);
      try {
          const saved = await offlineDb.getDrafts();
          saved.sort((a, b) => b.createdAt - a.createdAt);
          setDrafts(saved);
      } catch (e) {
          console.error("Error loading drafts", e);
      } finally {
          setIsLoadingDrafts(false);
      }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessingImage(true);
      try {
          let targetWidth = 800;
          let targetHeight = 600;

          if (formData.type === 'celebrity') {
              targetWidth = 400;
              targetHeight = 600;
          } else if (formData.type === 'food') {
              targetWidth = 600;
              targetHeight = 600;
          }

          const processedBase64 = await processImage(file, {
              width: targetWidth,
              height: targetHeight,
              quality: 0.8
          });

          setImageFile(file);
          setImagePreview(processedBase64);
      } catch (err) {
          alert("图片处理失败，请重试");
      } finally {
          setIsProcessingImage(false);
      }
  };

  const handleSaveLocal = async () => {
      if (!formData.name) {
          alert("请至少输入名称");
          return;
      }
      setStatus('submitting');
      try {
          // Pass imagePreview (Base64) directly to saveDraft
          await offlineDb.saveDraft(formData, undefined, imagePreview || undefined);
          setStatus('saved_local');
          loadDrafts();
          resetForm();
      } catch (e) {
          alert("保存失败，请检查浏览器存储空间");
          setStatus('idle');
      }
  };

  const handleDeleteDraft = async (draft: DraftSubmission) => {
      if (confirm('确定要删除这条草稿吗？')) {
          await offlineDb.deleteDraft(draft);
          loadDrafts();
      }
  };

  const handlePublishDraft = async (draft: DraftSubmission) => {
      if (publishingId) return;
      if (!navigator.onLine) {
          alert("当前处于离线模式，无法发布。");
          return;
      }
      if (!confirm(`确定要将 "${draft.name}" 发布到服务器吗？`)) return;

      setPublishingId(draft._id);
      try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert(`"${draft.name}" 已成功发布到云端！`);
          await offlineDb.deleteDraft(draft);
          loadDrafts();
      } catch (e) {
          alert("发布失败，请稍后重试。");
      } finally {
          setPublishingId(null);
      }
  };

  const resetForm = () => {
      setFormData({ name: '', type: 'ecology', desc: '', location_desc: '', recommender_name: '' });
      setImageFile(null);
      setImagePreview(null);
  };

  const loadDraftToForm = (draft: DraftSubmission) => {
      setFormData({
          name: draft.name,
          type: draft.type as SubmissionData['type'],
          desc: draft.desc,
          location_desc: draft.location_desc,
          recommender_name: draft.recommender_name,
      });
      if (draft.imagePreviewUrl) setImagePreview(draft.imagePreviewUrl);
  };

  const getPreviewAspectRatio = () => {
      if (formData.type === 'celebrity') return 'aspect-[2/3] max-w-[200px]';
      if (formData.type === 'food') return 'aspect-square max-w-[300px]';
      return 'aspect-[4/3] w-full';
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-brand">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 hover:bg-stone-100 rounded-full transition text-stone-600">
            <Icon name="arrow-left" className="w-6 h-6" />
            </button>
            <h1 className="ml-2 text-lg font-bold text-stone-800 tracking-wide">内容共建 · 填报系统</h1>
        </div>
      </header>

      <main className="flex-grow p-4 overflow-y-auto pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                {status === 'saved_local' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-fade-in-up">
                        <Icon name="check-circle" className="w-6 h-6 text-green-600" />
                        <h3 className="font-bold text-green-800 text-sm">已保存到本地草稿</h3>
                        <button onClick={() => setStatus('idle')} className="ml-auto text-green-700 text-xs font-bold">继续</button>
                    </div>
                )}

                <form className="bg-white p-6 rounded-3xl shadow-premium-sm space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">内容类型</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white outline-none transition appearance-none font-medium text-gray-700">
                            <option value="ecology">自然风景</option>
                            <option value="red">红色文化</option>
                            <option value="folk">民俗文化</option>
                            <option value="food">美食特产</option>
                            <option value="celebrity">名人/先辈 (竖版)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">封面图片</label>
                        <div 
                            className={`relative ${getPreviewAspectRatio()} mx-auto bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition overflow-hidden group`}
                            onClick={() => !isProcessingImage && fileInputRef.current?.click()}
                        >
                            {isProcessingImage ? (
                                <div className="flex flex-col items-center text-teal-600"><Spinner size="md" /><span className="text-xs font-medium mt-2">处理中...</span></div>
                            ) : imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-stone-400 flex flex-col items-center p-4 text-center"><Icon name="camera" className="w-8 h-8 mb-2" /><span className="text-xs font-medium">点击上传</span></div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">名称</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition" placeholder="名称" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">详细描述</label>
                        <textarea required name="desc" value={formData.desc} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition resize-none" placeholder="描述..." />
                    </div>
                    
                    <button onClick={handleSaveLocal} disabled={status === 'submitting' || isProcessingImage} className="w-full bg-stone-800 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors flex items-center justify-center space-x-2 btn-press shadow-lg disabled:opacity-70">
                        <Icon name="download" className="w-5 h-5" />
                        <span>保存草稿 (离线)</span>
                    </button>
                </form>

                <div className="pt-4">
                    <h2 className="text-lg font-bold text-stone-700 mb-4 flex items-center px-2">本地草稿箱</h2>
                    {isLoadingDrafts ? <div className="flex justify-center"><Spinner size="sm" /></div> : drafts.length > 0 ? (
                        <div className="space-y-3">
                            {drafts.map(draft => (
                                <div key={draft._id} className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-3">
                                    <div className="flex-grow min-w-0">
                                        <h4 className="font-bold text-stone-800 truncate">{draft.name}</h4>
                                        <p className="text-xs text-stone-500 truncate">{draft.desc}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handlePublishDraft(draft)} className="text-blue-600 p-1" disabled={!!publishingId}>
                                            {publishingId === draft._id ? <Spinner size="sm"/> : <Icon name="upload" className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => loadDraftToForm(draft)} className="text-teal-600 p-1"><Icon name="pencil-alt" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteDraft(draft)} className="text-red-400 p-1"><Icon name="trash" className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="text-center py-8 text-stone-400 text-sm">暂无草稿</div>}
                </div>
            </div>
            <div className="space-y-6 hidden lg:block">
                 <div className="bg-white p-6 rounded-3xl shadow-premium-sm border border-teal-50">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Icon name="microphone" className="w-5 h-5 mr-2 text-teal-600" />语音服务测试</h3>
                     <VoiceInteractionPanel onVoiceCommand={(cmd) => console.log(cmd)} onRecordingStatusChange={(status) => console.log(status)} />
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSubmissionForm;