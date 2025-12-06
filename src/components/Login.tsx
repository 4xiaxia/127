import React from "react";
import { Spinner } from "./common/Spinner";
import { Icon } from "./common/Icon";
import UncleAvatar from "./common/UncleAvatar";

const Login: React.FC<{
  onLogin: (id: string) => void;
  onAdminClick: () => void;
  geoLoading: boolean;
  geoError: any;
}> = ({ onLogin, onAdminClick, geoLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden font-brand p-6 bg-[#f0fdf4]">
      {/* Soft Background Decor */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-blue-200/30 rounded-full blur-3xl"></div>

      {/* Main Clay Card */}
      <div className="relative clay-card w-full max-w-[340px] pt-16 pb-8 px-6 text-center animate-fade-in-up">
        {/* Floating Avatar */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <UncleAvatar className="w-28 h-28" />
          {/* Status Dot */}
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full animate-pulse shadow-sm"></div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-800 tracking-wide font-brand">
          村官智能体
        </h1>
        <p className="text-slate-400 text-xs mt-2 mb-8 tracking-wider font-medium">
          AI 伴您 · 探索东里乡土
        </p>

        {/* Clay Buttons */}
        <div className="space-y-4 w-full">
          <button
            onClick={() => onLogin("wx_user_" + Date.now())}
            className="w-full clay-btn clay-btn-primary py-4 text-sm shadow-lg active:scale-95 gap-2"
          >
            <Icon name="chat-bubble" className="w-5 h-5" />
            <span>微信一键游</span>
          </button>

          <button
            onClick={() => onLogin("ali_user_" + Date.now())}
            className="w-full clay-btn clay-btn-secondary py-4 text-sm shadow-lg active:scale-95 gap-2"
          >
            <Icon name="bag" className="w-5 h-5" />
            <span>支付宝登录</span>
          </button>
        </div>

        {/* Admin Link */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={onAdminClick}
            className="text-xs text-slate-400 hover:text-teal-600 transition flex items-center justify-center space-x-1 w-full group font-medium"
          >
            <span>我是村民 / 管理员</span>
            <Icon
              name="chevron-down"
              className="w-3 h-3 transform -rotate-90 opacity-50 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Geo Loading State */}
        {geoLoading && (
          <div className="absolute top-4 right-4 text-slate-300">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center space-y-1">
        <p className="text-slate-400/60 text-[10px] tracking-widest font-light">
          Powered by Gemini AI · 公益助农
        </p>
        <p className="text-slate-400/40 text-[10px] font-serif-brand italic tracking-wider">
          Design by Gemini, Zo & Xiaxia
        </p>
      </div>
    </div>
  );
};

export default Login;
