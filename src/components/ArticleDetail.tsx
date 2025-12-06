import React, { useEffect } from "react";
import { Icon } from "./common/Icon";
import { Celebrity } from "../types";
import { ASSETS } from "../utils/constants";

interface ArticleDetailProps {
  data: Celebrity;
  onBack: () => void;
  onHookTrigger: (hook: string) => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({
  data,
  onBack,
  onHookTrigger,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#f0fdf4] min-h-screen animate-fade-in pb-32">
      {/* Hero Header */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img
          src={data.imageUrl}
          className="w-full h-full object-cover"
          alt={data.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0fdf4] via-transparent to-black/30"></div>

        <button
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-lg border border-white transition active:scale-90"
        >
          <Icon name="arrow-left" className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-[#f0fdf4] to-transparent">
          <div className="flex items-center space-x-2 mb-3">
            <span className="clay-tag-small clay-tag-red">名人堂</span>
            <span className="text-slate-600 text-xs font-medium tracking-wider">
              / 历史印记
            </span>
          </div>
          <h1 className="text-3xl font-serif-brand font-bold text-slate-900 mb-2">
            {data.name}
          </h1>
          <p className="text-lg text-slate-600 font-light italic">
            {data.title}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-6 max-w-3xl mx-auto">
        {/* Meta Info Card */}
        <div className="clay-card p-4 flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img
                src={ASSETS.AVATAR_A}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">村官小A</div>
              <div className="text-[10px] text-slate-400">整理于 东里村志</div>
            </div>
          </div>
          <button
            onClick={() => onHookTrigger("朗读这篇文章")}
            className="clay-btn clay-btn-white py-1.5 px-3 text-xs gap-1"
          >
            <Icon name="play" className="w-3 h-3 text-teal-500" />
            <span>听讲解</span>
          </button>
        </div>

        {/* Main Text */}
        <article className="prose prose-stone prose-lg max-w-none">
          <p className="lead text-lg text-slate-600 leading-relaxed font-serif-brand font-bold">
            {data.description}
          </p>
          <div className="my-6 h-1 w-16 bg-slate-200 rounded-full"></div>
          <p className="text-justify text-slate-700 leading-loose">
            {data.detailText}
          </p>
          <p className="text-justify text-slate-700 leading-loose mt-4">
            斯人已逝，风骨长存。今天我们走进东里村，依然能从那些斑驳的古厝、传世的家训中，感受到先辈们拳拳报国之心。
          </p>
        </article>

        {/* Interactive Hooks */}
        <div className="mt-12 clay-card bg-slate-50 border-slate-200 p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            延伸阅读 (AI 互动)
          </h3>
          <div className="flex flex-wrap gap-3">
            {["革命贡献", "家族后代", "相关遗址"].map((tag) => (
              <button
                key={tag}
                onClick={() => onHookTrigger(tag)}
                className="clay-btn clay-btn-white px-4 py-2 text-xs"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
