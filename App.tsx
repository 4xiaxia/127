import React, { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AdminPanelRefactored from './components/AdminPanelRefactored';
import AgentManager from './components/AgentManager';

// 🏛️ 东里村智能导游系统 - 主应用组件
// 军工品质，精准高效，极简实用

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'admin' | 'agent'>('admin');

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontSize: 14,
        },
      }}
    >
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #f0fdf4, #e6f7ed)',
        fontFamily: '"Noto Sans SC", system-ui, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          minHeight: '100vh',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 40px rgba(0,0,0,0.1)',
          backgroundColor: '#fafafa'
        }}>
          {/* 顶部导航栏 */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'rgba(240, 253, 244, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                {activeView === 'admin' ? '🏛️ 东里村智能导游管理后台' : '🤖 ANP多智能体演示'}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                background: '#e5e7eb',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                军工品质 · ANP协议 · 极简高效
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setActiveView('admin')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: activeView === 'admin' ? '#1677ff' : '#f3f4f6',
                  color: activeView === 'admin' ? 'white' : '#6b7280',
                  boxShadow: activeView === 'admin' ? '0 2px 4px rgba(22, 119, 255, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'admin') {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'admin') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                🏛️ 管理后台
              </button>
              <button
                onClick={() => setActiveView('agent')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: activeView === 'agent' ? '#722ed1' : '#f3f4f6',
                  color: activeView === 'agent' ? 'white' : '#6b7280',
                  boxShadow: activeView === 'agent' ? '0 2px 4px rgba(114, 46, 209, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeView !== 'agent') {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== 'agent') {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                🤖 Agent演示
              </button>
            </div>
          </div>

          {/* 主内容区域 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeView === 'admin' ? <AdminPanelRefactored /> : <AgentManager />}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default App;
