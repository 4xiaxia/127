import React, { useState } from 'react';
import { Card, Grid, NavBar, FloatButton, Transition } from 'antd-mobile';
import { AppstoreOutlined, UserOutlined } from '@ant-design/icons';

// Define category type
interface Category {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}

const CategoryHomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Define the 5 cultural tourism categories
  const categories: Category[] = [
    {
      id: 'red',
      title: '红色景点',
      description: '革命历史遗迹',
      color: 'bg-red-100',
      icon: '🚩',
    },
    {
      id: 'nature',
      title: '游玩导游',
      description: '自然风光体验',
      color: 'bg-green-100',
      icon: '🏞️',
    },
    {
      id: 'history',
      title: '乡镇历史',
      description: '村落文化传承',
      color: 'bg-blue-100',
      icon: '🏛️',
    },
    {
      id: 'media',
      title: '自媒体动态',
      description: '最新资讯分享',
      color: 'bg-yellow-100',
      icon: '📱',
    },
    {
      id: 'events',
      title: '活动通知',
      description: '精彩活动预告',
      color: 'bg-purple-100',
      icon: '🎉',
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    console.log(`Navigating to category: ${categoryId}`);
    // In a real app, this would navigate to the category page
    setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '390px', 
      margin: '0 auto', 
      minHeight: '844px',
      background: 'linear-gradient(to bottom, #f0f8ff, #e6f7ff)',
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
    }}>
      {/* Top Navigation Bar */}
      <NavBar
        style={{ 
          background: 'linear-gradient(to right, #4facfe, #00f2fe)',
          color: 'white',
          borderRadius: 0,
          '--border-bottom': 'none',
        }}
        right={<></>}
      >
        东里村文旅服务平台
      </NavBar>

      {/* Main Content Area */}
      <div style={{ padding: '20px 16px', flex: 1, overflow: 'auto' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          选择您感兴趣的分类
        </h2>

        {/* Grid for 5 categories in 2 columns */}
        <Grid 
          columns={2} 
          gap={16}
          style={{ marginBottom: '20px' }}
        >
          {categories.map((category, index) => (
            <Grid.Item key={category.id}>
              <Transition
                in={activeCategory === category.id}
                animation="cute-bounce"
                duration={300}
              >
                <Card
                  className="category-card"
                  style={{
                    borderRadius: '24px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 0 0 2px #fff inset, 0 4px 12px rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div style={{ 
                    fontSize: '28px', 
                    marginBottom: '12px' 
                  }}>
                    {category.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    margin: '8px 0' 
                  }}>
                    {category.title}
                  </h3>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {category.description}
                  </p>
                </Card>
              </Transition>
            </Grid.Item>
          ))}
        </Grid>

        {/* Additional Info Section */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '10px' 
          }}>
            东里村欢迎您
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            探索红色历史，体验自然风光，感受乡村文化魅力
          </p>
        </div>
      </div>

      {/* Floating Agent Button */}
      <FloatButton
        icon={<UserOutlined />}
        style={{ 
          right: '20px', 
          bottom: '20px',
          backgroundColor: '#1677ff',
          color: 'white',
          boxShadow: '0 4px 12px rgba(22, 119, 255, 0.4)'
        }}
        onClick={() => {
          console.log('Opening global agent dialog');
          // In a real app, this would open the agent dialog
        }}
      />
    </div>
  );
};

export default CategoryHomePage;