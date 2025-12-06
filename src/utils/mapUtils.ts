
import { TIME_CONSTANTS } from './magicNumbers';

/**
 * 零依赖地图导航工具
 * 核心逻辑：微信内跳高德小程序，微信外跳支付宝高德小程序
 */
export const openMapNavigation = (lat: number, lng: number, name: string) => {
  const ua = navigator.userAgent.toLowerCase();
  const isWechat = ua.includes('micromessenger');
  const encodedName = encodeURIComponent(name);

  if (isWechat) {
    // 微信内：直接跳高德小程序（无授权，微信自动识别）
    // 注意：实际生产中微信小程序Scheme可能需要服务端生成，但这里使用通用的URL Scheme尝试
    // 如果通用Scheme被封，建议保留备用方案：提示用户点击右上角在浏览器打开
    const wxMiniScheme = `wxmini://miniprogram/gh_600e65a561716960/pages/navi/navi?lat=${lat}&lon=${lng}&name=${encodedName}`;
    
    // 尝试跳转，如果失败提示用户
    window.location.href = wxMiniScheme;
    
    // 兜底提示
    setTimeout(() => {
      alert("如果未跳转，请点击右上角选择'在浏览器打开'，将自动唤起支付宝导航。");
    }, TIME_CONSTANTS.TWO_SECONDS_MS);
  } else {
    // 微信外：强制跳支付宝高德小程序（支付宝内置能力，极高成功率）
    const aliScheme = `alipays://platformapi/startapp?appId=20000067&page=pages/navi/navi&lat=${lat}&lon=${lng}&name=${encodedName}`;
    window.location.href = aliScheme;
  }
};
