import React, { useState } from 'react';
import { List, PullToRefresh, NavBar, Badge, Typography, Empty, Loading } from 'antd-mobile';
import { RightOutline } from 'antd-mobile-icons';

// Define spot type
interface Spot {
  id: string;
  title: string;
  description: string;
  type: 'martyr' | 'scenic' | 'event';
  date?: string; // For events
  location?: string; // For scenic spots
}

const SpotListPage: React.FC = () => {
  const [spots, setSpots] = useState<Spot[]>([
    {
      id: '1',
      title: '东里村革命烈士纪念碑',
      description: '为纪念在革命斗争中牺牲的烈士而建',
      type: 'martyr',
      location: '村中心广场'
    },
    {
      id: '2',
      title: '红色文化展览馆',
      description: '展示东里村革命历史和文物',
      type: 'martyr',
      location: '村东侧'
    },
    {
      id: '3',
      title: '古槐树遗址',
      description: '百年古槐，见证村庄历史变迁',
      type: 'scenic',
      location: '村西侧'
    },
    {
      id: '4',
      title: '荷花池景区',
      description: '夏季荷花盛开，景色宜人',
      type: 'scenic',
      location: '村南侧'
    },
    {
      id: '5',
      title: '东里村丰收节',
      description: '庆祝丰收的传统节日活动',
      type: 'event',
      date: '每年10月'
    },
    {
      id: '6',
      title: '红色故事分享会',
      description: '邀请老党员分享革命故事',
      type: 'event',
      date: '每月15日'
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Function to get badge text and color based on type
  const getBadgeProps = (type: string) => {
    switch (type) {
      case 'martyr':
        return { text: '烈士', color: 'red' };
      case 'scenic':
        return { text: '景点', color: 'blue' };
      case 'event':
        return { text: '活动', color: 'yellow' };
      default:
        return { text: '其他', color: 'gray' };
    }
  };

  // Simulate pull to refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // Simulate loading more data
  const loadMore = () => {
    if (!hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      // Add more spots (in a real app, this would be from an API)
      const newSpots: Spot[] = [
        {
          id: `${spots.length + 1}`,
          title: `新增景点 ${spots.length + 1}`,
          description: '这是一处新发现的景点',
          type: spots.length % 3 === 0 ? 'martyr' : spots.length % 3 === 1 ? 'scenic' : 'event',
          location: '村北侧'
        }
      ];
      setSpots(prev => [...prev, ...newSpots]);
      setIsLoading(false);
      
      // For demo purposes, stop loading more after 3 times
      if (spots.length > 10) {
        setHasMore(false);
      }
    }, 1000);
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '390px', 
      margin: '0 auto', 
      minHeight: '844px',
      background: '#f5f5f5',
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
        烈士/景点列表
      </NavBar>

      {/* Pull to Refresh Container */}
      <PullToRefresh
        onRefresh={handleRefresh}
        style={{ height: 'calc(100vh - 50px)', overflow: 'auto' }}
      >
        {/* List Container */}
        {spots.length > 0 ? (
          <List 
            header="东里村文旅景点" 
            style={{ background: 'transparent', padding: '16px' }}
          >
            {spots.map((spot) => {
              const badgeProps = getBadgeProps(spot.type);
              return (
                <List.Item
                  key={spot.id}
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => {
                    console.log(`Navigating to spot: ${spot.title}`);
                    // In a real app, this would navigate to the spot detail page
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Badge - Type indicator */}
                    <Badge 
                      content={badgeProps.text} 
                      color={badgeProps.color}
                      style={{ marginRight: '12px' }}
                    />
                    
                    {/* Content - Title and description */}
                    <div style={{ flex: 1 }}>
                      <Typography.Paragraph 
                        style={{ 
                          margin: 0, 
                          fontWeight: 'bold', 
                          color: '#1f2937',
                          fontSize: '16px'
                        }}
                      >
                        {spot.title}
                      </Typography.Paragraph>
                      <Typography.Paragraph 
                        style={{ 
                          margin: '4px 0 0', 
                          color: '#6b7280',
                          fontSize: '14px'
                        }}
                        ellipsis={{ rows: 1 }}
                      >
                        {spot.type === 'event' ? spot.date : spot.location} • {spot.description}
                      </Typography.Paragraph>
                    </div>
                    
                    {/* Arrow - indicates navigability */}
                    <RightOutline style={{ color: '#d1d5db', fontSize: '16px' }} />
                  </div>
                </List.Item>
              );
            })}
            
            {/* Load More Indicator */}
            {isLoading && hasMore && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Loading color="primary" />
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                  加载更多...
                </div>
              </div>
            )}
            
            {!hasMore && (
              <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af' }}>
                已加载全部内容
              </div>
            )}
          </List>
        ) : (
          // Empty state when no spots are available
          <div style={{ marginTop: '100px' }}>
            <Empty 
              image="network" 
              description="暂无相关内容" 
            />
          </div>
        )}
      </PullToRefresh>
    </div>
  );
};

export default SpotListPage;