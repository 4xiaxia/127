import React from 'react';
import { Card, List, Button } from 'antd-mobile';

const DemoPage: React.FC = () => {
  const pages = [
    { path: '/login', title: '登录页', description: '手机号登录、验证码、第三方登录' },
    { path: '/chat', title: 'Chat/Agent对话页', description: '消息列表、输入框、语音输入' },
    { path: '/home', title: '分类首页', description: '5大文旅分类卡片、网格布局' },
    { path: '/spots', title: '烈士/景点列表页', description: '列表、下拉刷新、加载更多' },
    { path: '/spot/1', title: '烈士/景点详情页', description: '图片、音频播放、打卡功能' },
    { path: '/profile', title: '个人中心页', description: '用户信息、打卡记录' },
  ];

  const openPage = (path: string) => {
    // In a real implementation, this would use React Router's navigate
    console.log(`Opening page: ${path}`);
    window.location.hash = path;
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '390px', 
      margin: '0 auto', 
      minHeight: '844px',
      background: 'linear-gradient(to bottom, #f0f8ff, #e6f7ff)',
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      padding: '20px 16px'
    }}>
      <Card 
        style={{ 
          borderRadius: '24px', 
          border: '1px solid #e8e8e8', 
          boxShadow: '0 0 0 2px #fff inset',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          margin: '0 0 8px 0' 
        }}>
          东里村文旅项目
        </h1>
        <p style={{ 
          color: '#6b7280', 
          margin: 0,
          fontSize: '14px'
        }}>
          Ant Design Mobile 组件演示
        </p>
      </Card>

      <Card 
        style={{ 
          borderRadius: '24px', 
          border: '1px solid #e8e8e8', 
          boxShadow: '0 0 0 2px #fff inset',
        }}
      >
        <List header="所有页面演示">
          {pages.map((page, index) => (
            <List.Item 
              key={index}
              onClick={() => openPage(page.path)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div style={{ fontWeight: '500', color: '#1f2937' }}>{page.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {page.description}
                </div>
              </div>
              <Button 
                size="small" 
                style={{ 
                  borderRadius: '12px',
                  marginLeft: '12px'
                }}
              >
                查看
              </Button>
            </List.Item>
          ))}
        </List>
      </Card>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '20px',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        <p>基于 Ant Design Mobile v5 构建</p>
        <p>适配 390×844 移动端尺寸</p>
      </div>
    </div>
  );
};

export default DemoPage;