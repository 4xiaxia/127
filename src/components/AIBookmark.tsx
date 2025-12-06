import React, { useState, useRef } from "react";
import { Spot } from "../types";
import { Icon } from "./common/Icon";
import * as offlineDb from "../services/offlineDb";

interface AIBookmarkProps {
  spot: Spot;
  onClose: () => void;
  onSuccess: () => void;
}

const AIBookmark: React.FC<AIBookmarkProps> = ({
  spot,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<"upload" | "generating" | "result">(
    "upload"
  );
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUserImage(ev.target?.result as string);
        generateBookmark();
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBookmark = () => {
    setStep("generating");
    // Simulate AI Processing / Agent B collaboration
    setTimeout(() => {
      setStep("result");
      // Trigger "Light Up" logic in backend
      saveLightUpStatus();
    }, 2000);
  };

  const saveLightUpStatus = () => {
    // In a real app, send to server. Here, save to local storage.
    const litSpots = JSON.parse(
      localStorage.getItem("village_lit_spots") || "[]"
    );
    if (!litSpots.includes(spot.id)) {
      litSpots.push(spot.id);
      localStorage.setItem("village_lit_spots", JSON.stringify(litSpots));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdfbf7] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>

        {step === "upload" && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-stone-400">
              <Icon name="camera" className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-serif-brand font-bold text-stone-800">
                制作打卡书签
              </h3>
              <p className="text-sm text-stone-500 mt-2">
                上传一张照片，AI为您生成专属的
                <br />
                “东里记忆”书签，并点亮该景点。
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-stone-800 text-stone-50 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
            >
              选择照片 / 拍照
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {step === "generating" && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto"></div>
            <p className="text-stone-600 font-serif-brand">
              Agent B 正在设计书签...
            </p>
            <p className="text-xs text-stone-400">正在合成景点印章与您的影像</p>
          </div>
        )}

        {step === "result" && (
          <div className="relative">
            {/* The Bookmark Visual */}
            <div className="relative aspect-[3/5] bg-stone-100 w-full overflow-hidden group">
              {/* Background: Spot Image */}
              <img
                src={spot.imageUrl}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>

              {/* User Photo Overlay (Circle) */}
              <div className="absolute top-6 right-6 w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden shadow-lg">
                <img
                  src={userImage || ""}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="w-12 h-12 border-2 border-red-600 text-red-600 rounded-md flex items-center justify-center font-serif-brand font-bold text-xl mb-4 bg-white/10 backdrop-blur-sm transform rotate-3">
                  打卡
                </div>
                <h2 className="text-2xl font-serif-brand font-bold mb-1">
                  {spot.name}
                </h2>
                <p className="text-xs opacity-80 font-light tracking-widest">
                  {new Date().toLocaleDateString()} · 东里村
                </p>
                <p className="mt-4 text-sm font-serif-brand italic opacity-90 border-l-2 border-red-500 pl-3">
                  “{spot.intro_short}”
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-white border-t border-stone-100 flex gap-3">
              <button className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-bold text-sm">
                保存图片
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 py-2.5 bg-red-700 text-white rounded-lg font-bold text-sm shadow-md"
              >
                完成点亮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBookmark;
