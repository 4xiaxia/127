import React, { useState } from 'react';
import { Card, List, Badge, Empty, Dialog, Typography } from 'antd-mobile';
import { UserOutlined, PhoneOutlined, IdcardOutlined, CheckCircleOutlined } from '@ant-design/icons';

// Define user type
interface User {
  id: string;
  name: string;
  phone: string;
  uid: string;
  avatar: string;
}

// Define punch record type
interface PunchRecord {
  id: string;
  spotName: string;
  date: string;
  location: string;
}

const PersonalCenterPage: React.FC = () => {
  const [user, setUser] = useState<User>({
    id: 'user_123',
    name: '游客用户',
    phone: '138****8888',
    uid: 'UID_789456123',
    avatar: 'https://via.placeholder.com/80x80/4a90e2/ffffff?text=头像'
  });
  
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([
    {
      id: 'punch_1',
      spotName: '东里村革命烈士纪念碑',
      date: '2023-10-15',
      location: '村中心广场'
    },
    {
      id: 'punch_2',
      spotName: '红色文化展览馆',
      date: '2023-10-16',
      location: '村东侧'
    },
    {
      id: 'punch_3',
      spotName: '荷花池景区',
      date: '2023-10-17',
      location: '村南侧'
    }
  ]);

  const handleModifyInfo = () => {
    Dialog.alert({
      title: '提示',
      content: '修改个人信息功能正在开发中，敬请期待！',
      confirmText: '确定',
    });
  };

  const handleLogout = () => {
    Dialog.confirm({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      onConfirm: () => {
        console.log('User logged out');
        // In a real app, this would handle logout logic
      }
    });
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
      {/* User Info Card */}
      <Card 
        style={{ 
          borderRadius: '24px', 
          border: '1px solid #e8e8e8', 
          boxShadow: '0 0 0 2px #fff inset',
          margin: '20px 16px 16px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            marginRight: '16px',
            border: '2px solid #e8e8e8'
          }}>
            <img 
              src={user.avatar} 
              alt="User Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  fontSize: '18px'
                }}
              >
                {user.name}
              </Typography.Title>
              
              {/* Badge showing punch count */}
              <Badge 
                content={`${punchRecords.length}个`} 
                color="red"
                style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-8px',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '12px'
                }}
              >
                <div style={{ width: '24px', height: '24px' }}></div>
              </Badge>
            </div>
            
            <Typography.Text 
              type="secondary" 
              style={{ 
                display: 'block', 
                marginTop: '4px',
                fontSize: '14px'
              }}
            >
              <PhoneOutlined style={{ marginRight: '4px' }} />
              {user.phone}
            </Typography.Text>
            
            <Typography.Text 
              type="secondary" 
              style={{ 
                display: 'block', 
                marginTop: '2px',
                fontSize: '12px'
              }}
            >
              <IdcardOutlined style={{ marginRight: '4px' }} />
              {user.uid}
            </Typography.Text>
          </div>
        </div>
      </Card>

      {/* User Actions List */}
      <List 
        header="个人服务" 
        style={{ 
          margin: '0 16px 16px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <List.Item
          prefix={<CheckCircleOutlined style={{ color: '#1677ff', fontSize: '18px' }} />}
          onClick={() => {
            console.log('Viewing punch records');
            // In a real app, this would navigate to punch records page
          }}
        >
          我的打卡记录
        </List.Item>
        
        <List.Item
          prefix={<PhoneOutlined style={{ color: '#1677ff', fontSize: '18px' }} />}
          onClick={handleModifyInfo}
        >
          修改手机号
        </List.Item>
        
        <List.Item
          prefix={<IdcardOutlined style={{ color: '#1677ff', fontSize: '18px' }} />}
          onClick={handleModifyInfo}
        >
          修改个人信息
        </List.Item>
      </List>

      {/* Punch Records Section */}
      <Card 
        style={{ 
          borderRadius: '24px', 
          border: '1px solid #e8e8e8', 
          boxShadow: '0 0 0 2px #fff inset',
          margin: '0 16px 16px'
        }}
      >
        <Typography.Title 
          level={6} 
          style={{ 
            margin: '0 0 16px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            fontSize: '16px',
            textAlign: 'center'
          }}
        >
          最近打卡记录
        </Typography.Title>
        
        {punchRecords.length > 0 ? (
          <List style={{ background: 'transparent' }}>
            {punchRecords.map((record) => (
              <List.Item 
                key={record.id}
                prefix={<CheckCircleOutlined style={{ color: '#4CAF50', fontSize: '18px' }} />}
                extra={record.date}
                onClick={() => {
                  console.log(`Viewing record: ${record.spotName}`);
                  // In a real app, this would navigate to the spot detail
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>{record.spotName}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {record.location}
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Empty 
              image="auto" 
              description="暂无打卡记录" 
            />
          </div>
        )}
      </Card>

      {/* Logout Button */}
      <div style={{ padding: '0 16px 20px' }}>
        <List>
          <List.Item
            style={{ 
              textAlign: 'center', 
              color: '#ef4444',
              fontWeight: '500',
              fontSize: '16px'
            }}
            onClick={handleLogout}
          >
            退出登录
          </List.Item>
        </List>
      </div>
    </div>
  );
};

export default PersonalCenterPage;