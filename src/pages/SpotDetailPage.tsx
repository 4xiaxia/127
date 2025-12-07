import React, { useState } from 'react';
import { Card, Image, Typography, Slider, Tag, Button } from 'antd-mobile';
import { PlayCircleOutline, PauseCircleOutline } from 'antd-mobile-icons';

// Define spot detail type
interface SpotDetail {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl?: string;
  type: 'martyr' | 'scenic' | 'event';
  location?: string;
  history?: string;
  isPunched?: boolean; // Whether the user has checked in
}

const SpotDetailPage: React.FC = () => {
  const [spotDetail, setSpotDetail] = useState<SpotDetail>({
    id: '1',
    title: '东里村革命烈士纪念碑',
    description: '为纪念在革命斗争中牺牲的烈士而建，是东里村重要的红色教育基地。纪念碑高约10米，正面刻有“革命烈士永垂不朽”八个大字。',
    imageUrl: 'https://via.placeholder.com/390x200/4a90e2/ffffff?text=烈士纪念碑',
    audioUrl: 'https://example.com/audio/monument.mp3', // Placeholder
    type: 'martyr',
    location: '东里村中心广场',
    history: '该纪念碑建于1985年，是为了纪念在抗日战争和解放战争中牺牲的23位烈士而建。每年清明节，村民们都会来此献花祭奠。',
    isPunched: false
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Simulate audio playback
  const toggleAudioPlayback = () => {
    if (!spotDetail.audioUrl) {
      console.log('No audio available for this spot');
      return;
    }
    
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? 'Pausing audio' : 'Playing audio');
    
    // Simulate audio progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Simulate checking in
  const handleCheckIn = () => {
    setSpotDetail(prev => ({
      ...prev,
      isPunched: true
    }));
    console.log('Checked in successfully');
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
      {/* Main Detail Container */}
      <div style={{ padding: '16px' }}>
        <Card 
          style={{ 
            borderRadius: '24px', 
            border: '1px solid #e8e8e8', 
            boxShadow: '0 0 0 2px #fff inset',
            overflow: 'hidden'
          }}
        >
          {/* Image Section */}
          <Image
            src={spotDetail.imageUrl}
            style={{ 
              width: '100%', 
              height: '200px', 
              objectFit: 'cover',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px'
            }}
            fit="cover"
            onClick={() => {
              // In a real app, this would open image preview
              console.log('Opening image preview');
            }}
          />
          
          {/* Title and Check-in Tag */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 16px 8px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Typography.Title 
              level={4} 
              style={{ 
                margin: 0, 
                fontWeight: 'bold', 
                color: '#1f2937',
                fontSize: '18px'
              }}
            >
              {spotDetail.title}
            </Typography.Title>
            
            <Tag 
              color={spotDetail.isPunched ? 'success' : 'default'}
              style={{ 
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              {spotDetail.isPunched ? '已打卡' : '未打卡'}
            </Tag>
          </div>
          
          {/* Location and Type Info */}
          <div style={{ padding: '8px 16px' }}>
            {spotDetail.location && (
              <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                📍 {spotDetail.location}
              </Typography.Text>
            )}
          </div>
          
          {/* Description Section */}
          <div style={{ padding: '16px' }}>
            <Typography.Title 
              level={6} 
              style={{ 
                margin: '0 0 8px 0', 
                fontWeight: 'bold', 
                color: '#1f2937',
                fontSize: '16px'
              }}
            >
              景点介绍
            </Typography.Title>
            <Typography.Paragraph 
              style={{ 
                margin: 0, 
                color: '#4b5563',
                lineHeight: 1.6,
                fontSize: '14px'
              }}
            >
              {spotDetail.description}
            </Typography.Paragraph>
            
            {spotDetail.history && (
              <>
                <Typography.Title 
                  level={6} 
                  style={{ 
                    margin: '16px 0 8px 0', 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: '16px'
                  }}
                >
                  历史背景
                </Typography.Title>
                <Typography.Paragraph 
                  style={{ 
                    margin: 0, 
                    color: '#4b5563',
                    lineHeight: 1.6,
                    fontSize: '14px'
                  }}
                >
                  {spotDetail.history}
                </Typography.Paragraph>
              </>
            )}
          </div>
          
          {/* Audio Section */}
          {spotDetail.audioUrl && (
            <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
              <Typography.Title 
                level={6} 
                style={{ 
                  margin: '0 0 12px 0', 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  fontSize: '16px'
                }}
              >
                音频讲解
              </Typography.Title>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button
                  icon={isPlaying ? <PauseCircleOutline /> : <PlayCircleOutline />}
                  onClick={toggleAudioPlayback}
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%',
                    backgroundColor: '#1677ff',
                    color: 'white',
                    border: 'none'
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <Slider
                    min={0}
                    max={100}
                    value={audioProgress}
                    onChange={setAudioProgress}
                    style={{ margin: '0 8px' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    <span>{Math.floor(audioProgress / 100 * 180)}s</span>
                    <span>3:00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Check-in Button */}
          <div style={{ padding: '16px' }}>
            <Button
              color={spotDetail.isPunched ? 'default' : 'primary'}
              size="large"
              onClick={handleCheckIn}
              disabled={spotDetail.isPunched}
              style={{ 
                borderRadius: '22px',
                height: '44px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {spotDetail.isPunched ? '已打卡 ✓' : '点击打卡'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SpotDetailPage;