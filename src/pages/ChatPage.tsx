import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, PullToRefresh, List, FloatButton, Popup, Avatar } from 'antd-mobile';
import { SendOutlined, AudioOutlined, UserOutlined } from '@ant-design/icons';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'agent';
  timestamp: number;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '欢迎来到东里村！我是您的智能导游助手，有什么可以帮您的吗？', type: 'agent', timestamp: Date.now() - 30000 },
    { id: '2', text: '你好，我想了解一下东里村的红色历史', type: 'user', timestamp: Date.now() - 15000 },
    { id: '3', text: '东里村有着丰富的红色历史，这里曾是革命根据地，您可以参观烈士纪念馆了解详情。', type: 'agent', timestamp: Date.now() - 5000 },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [agentResponse, setAgentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputValue,
      type: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        text: `关于"${inputValue}"，东里村有丰富的信息。您可以了解更多关于这个主题的内容，或者参观相关景点获得更深入的体验。`,
        type: 'agent',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    // Simulate voice input functionality
    console.log('Starting voice input');
    // In a real app, this would use the browser's speech recognition API
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '390px', 
      margin: '0 auto', 
      minHeight: '844px',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Navigation Bar */}
      <Card 
        style={{ 
          borderRadius: '0', 
          border: 'none', 
          borderBottom: '1px solid #e8e8e8',
          backgroundColor: '#f0f8ff',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>智能导游助手</h2>
        </div>
      </Card>

      {/* Messages List */}
      <PullToRefresh
        onRefresh={() => {
          // Simulate loading more messages
          return new Promise(resolve => {
            setTimeout(() => {
              setMessages(prev => [
                { id: `old-${Date.now()}`, text: '这是更早的消息', type: 'agent', timestamp: Date.now() - 100000 },
                ...prev
              ]);
              resolve();
            }, 1000);
          });
        }}
        style={{ flex: 1, overflow: 'auto', padding: '16px' }}
      >
        <List style={{ background: 'transparent' }}>
          {messages.map((message) => (
            <List.Item 
              key={message.id} 
              style={{ 
                display: 'flex', 
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', 
                marginBottom: '12px' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                {message.type === 'agent' && (
                  <Avatar 
                    style={{ 
                      backgroundColor: '#1677ff', 
                      marginRight: '8px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                    icon={<UserOutlined />}
                  />
                )}
                <div 
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: message.type === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    backgroundColor: message.type === 'user' ? '#1677ff' : '#ffffff',
                    color: message.type === 'user' ? 'white' : '#333',
                    wordWrap: 'break-word',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {message.text}
                </div>
                {message.type === 'user' && (
                  <Avatar 
                    style={{ 
                      backgroundColor: '#4CAF50', 
                      marginLeft: '8px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                    icon={<UserOutlined />}
                  />
                )}
              </div>
            </List.Item>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </PullToRefresh>

      {/* Input Area */}
      <Card 
        style={{ 
          borderRadius: '0', 
          border: 'none', 
          borderTop: '1px solid #e8e8e8',
          padding: '12px 16px',
          backgroundColor: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            value={inputValue}
            onChange={setInputValue}
            placeholder="请输入问题或点击语音..."
            style={{ 
              flex: 1, 
              borderRadius: '20px', 
              height: '40px',
              padding: '0 16px',
              border: '1px solid #e8e8e8',
            }}
            onEnterPress={handleSendMessage}
          />
          <Button
            icon={<AudioOutlined />}
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              padding: 0,
              backgroundColor: '#f0f8ff',
              borderColor: '#1677ff'
            }}
            onClick={handleVoiceInput}
          />
          <Button
            icon={<SendOutlined />}
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              padding: 0,
              backgroundColor: '#1677ff',
              color: 'white'
            }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          />
        </div>
      </Card>

      {/* Floating Agent Button */}
      <FloatButton
        icon={<UserOutlined />}
        style={{ 
          right: '20px', 
          bottom: '80px',
          backgroundColor: '#1677ff',
          color: 'white',
          boxShadow: '0 4px 12px rgba(22, 119, 255, 0.4)'
        }}
        onClick={() => setShowPopup(true)}
      />

      {/* Agent Popup Dialog */}
      <Popup
        visible={showPopup}
        onMaskClick={() => setShowPopup(false)}
        bodyStyle={{ 
          borderTopLeftRadius: '24px', 
          borderTopRightRadius: '24px',
          minHeight: '50vh',
          background: 'linear-gradient(to bottom, #f0f8ff, #e6f7ff)',
        }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Avatar 
              style={{ 
                backgroundColor: '#1677ff', 
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }} 
              icon={<UserOutlined />}
            />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>村官小助理</h3>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '14px' }}>随时为您服务</p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ lineHeight: '1.6', color: '#4b5563' }}>
              您好！我是东里村的智能导游助手，可以为您解答关于红色历史、景点介绍、游玩路线等问题。
              有什么需要帮助的吗？
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              style={{ borderRadius: '16px', flex: '1 1 auto' }}
              onClick={() => {
                setInputValue('东里村有哪些红色景点？');
                setShowPopup(false);
              }}
            >
              红色景点
            </Button>
            <Button 
              size="small" 
              style={{ borderRadius: '16px', flex: '1 1 auto' }}
              onClick={() => {
                setInputValue('东里村的历史故事');
                setShowPopup(false);
              }}
            >
              历史故事
            </Button>
            <Button 
              size="small" 
              style={{ borderRadius: '16px', flex: '1 1 auto' }}
              onClick={() => {
                setInputValue('推荐游玩路线');
                setShowPopup(false);
              }}
            >
              游玩路线
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default ChatPage;