import React, { useState, useRef } from 'react';
import { Button, Input, Card, Toast, Divider, Space } from 'antd-mobile';
import { WechatOutlined, AlipayCircleOutlined, UserOutlined } from '@ant-design/icons';

// 引入全局样式：约束页面尺寸，适配 390×844 尺寸
const LoginPage: React.FC = () => {
  // 手机号/验证码状态
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 手机号验证规则
  const validatePhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone);

  // 获取验证码逻辑
  const getCode = () => {
    if (countdown > 0) return;
    if (!validatePhone(phone)) {
      Toast.show({
        content: '请输入有效的中国大陆手机号',
        duration: 2000,
      });
      return;
    }

    // 开始倒计时
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current!);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 弱网适配：延迟提示
    setTimeout(() => {
      Toast.show({
        content: '验证码已发送至您的手机',
        duration: 2000,
      });
    }, 800);
  };

  // 手机号登录逻辑
  const handlePhoneLogin = () => {
    if (!validatePhone(phone)) {
      Toast.show({ content: '手机号格式错误', duration: 2000 });
      return;
    }
    if (code.length !== 6) {
      Toast.show({ content: '请输入6位验证码', duration: 2000 });
      return;
    }

    // 弱网加载提示
    Toast.show({ content: '登录中...', icon: 'loading' });
    // 模拟弱网请求
    setTimeout(() => {
      Toast.show({
        content: '登录成功！欢迎来到东里村',
        duration: 2000,
      });
      // 跳转Chat页面（模拟）
      setTimeout(() => {
        // In a real app, this would navigate to the chat page
        console.log('Navigating to chat page');
      }, 2000);
    }, 1500);
  };

  // 第三方登录逻辑
  const handleThirdLogin = (type: 'wx' | 'alipay' | 'guest') => {
    const tips = {
      wx: '正在唤起微信授权...',
      alipay: '正在唤起支付宝授权...',
      guest: '游客登录中...',
    };
    const successTips = {
      wx: '微信登录成功！',
      alipay: '支付宝登录成功！',
      guest: '游客登录成功！',
    };
    const delay = type === 'guest' ? 1000 : 1500;

    Toast.show({ content: tips[type], duration: 1500 });
    setTimeout(() => {
      Toast.show({
        content: successTips[type],
        duration: 2000,
      });
      setTimeout(() => {
        // In a real app, this would navigate to the chat page
        console.log('Navigating to chat page');
      }, delay);
    }, delay);
  };

  return (
    <div className="login-page" style={{ 
      width: '100%', 
      maxWidth: '390px', 
      margin: '0 auto', 
      minHeight: '844px',
      padding: '20px',
      background: 'linear-gradient(to bottom, #f0f8ff, #e6f7ff)',
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
    }}>
      {/* 顶部标题栏 */}
      <div className="top-bar" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>东里村文旅服务平台</h1>
      </div>

      {/* 登录卡片（黏土风格） */}
      <Card 
        className="clay-card" 
        style={{ 
          borderRadius: '24px', 
          border: '1px solid #e8e8e8', 
          boxShadow: '0 0 0 2px #fff inset', 
          padding: '30px 20px'
        }}
      >
        {/* LOGO占位 */}
        <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '20px' }}>🏞️</div>

        {/* 手机号输入 */}
        <div className="form-item" style={{ marginBottom: '15px' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>请输入手机号</label>
          <Input
            type="tel"
            placeholder="请输入11位手机号"
            value={phone}
            onChange={val => setPhone(val as string)}
            className="form-input"
            style={{ borderRadius: '12px', height: '40px' }}
          />
        </div>

        {/* 验证码输入 + 倒计时按钮 */}
        <div className="form-item" style={{ marginBottom: '15px' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>请输入验证码</label>
          <Space className="code-row" style={{ width: '100%' }}>
            <Input
              type="number"
              placeholder="6位验证码"
              value={code}
              onChange={val => setCode(val as string)}
              className="code-input"
              style={{ borderRadius: '12px', height: '40px', flex: 1 }}
            />
            <Button
              className="get-code-btn"
              disabled={countdown > 0}
              onClick={getCode}
              style={{
                backgroundColor: countdown > 0 ? '#e8e8e8' : '#1677ff',
                borderColor: countdown > 0 ? '#e8e8e8' : '#1677ff',
                borderRadius: '8px',
                height: '40px',
                width: '100px',
                marginLeft: '10px'
              }}
            >
              {countdown > 0 ? `重新发送(${countdown})` : '获取验证码'}
            </Button>
          </Space>
        </div>

        {/* 手机号登录按钮 */}
        <Button
          className="login-btn"
          color="primary"
          onClick={handlePhoneLogin}
          style={{ backgroundColor: '#2d3748', marginTop: 15, borderRadius: '16px', height: '48px' }}
        >
          手机号登录
        </Button>

        {/* 分隔线 */}
        <Divider className="divider" style={{ margin: '20px 0', color: '#9ca3af' }}>其他登录方式</Divider>

        {/* 微信登录 */}
        <Button
          className="third-login-btn"
          icon={<WechatOutlined />}
          onClick={() => handleThirdLogin('wx')}
          style={{ backgroundColor: '#07c160', marginBottom: 12, borderRadius: '16px', height: '48px' }}
        >
          微信登录
        </Button>

        {/* 支付宝登录 */}
        <Button
          className="third-login-btn"
          icon={<AlipayCircleOutlined />}
          onClick={() => handleThirdLogin('alipay')}
          style={{ backgroundColor: '#1677ff', marginBottom: 12, borderRadius: '16px', height: '48px' }}
        >
          支付宝登录
        </Button>

        {/* 游客登录 */}
        <Button
          className="third-login-btn"
          icon={<UserOutlined />}
          onClick={() => handleThirdLogin('guest')}
          style={{ backgroundColor: '#f5f5f5', color: '#4a5568', borderRadius: '16px', height: '48px' }}
        >
          游客登录
        </Button>
      </Card>

      {/* 底部协议 */}
      <div className="agreement" style={{ 
        textAlign: 'center', 
        marginTop: '20px', 
        fontSize: '12px', 
        color: '#9ca3af' 
      }}>
        登录即同意 <a href="javascript:;" style={{ color: '#1677ff' }}>《用户服务协议》</a> 和 <a href="javascript:;" style={{ color: '#1677ff' }}>《隐私政策》</a>
      </div>
      <div className="copyright" style={{ 
        textAlign: 'center', 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#d1d5db' 
      }}>
        Design by 东里村团队
      </div>
    </div>
  );
};

export default LoginPage;