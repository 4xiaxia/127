import React, { useState } from 'react';

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface KnowledgeManagementProps {
  knowledgeBase: KnowledgeItem[];
  onAdd: () => void;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
}

const KnowledgeManagement: React.FC<KnowledgeManagementProps> = ({ 
  knowledgeBase, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#52c41a';
      case 'inactive':
        return '#faad14';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3>📚 C数据知识库管理</h3>
          <button
            onClick={onAdd}
            style={{
              background: '#1677ff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            + 添加知识
          </button>
        </div>
        
        <div style={{
          background: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <strong>结构化知识库：</strong>一个萝卜一个坑填充，便于管理和维护。每个知识条目包含分类、标题、内容、标签等结构化信息。
        </div>
      </div>

      {/* 知识库表格 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>分类</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>标题</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>标签</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>创建时间</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeBase.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{item.category}</td>
                  <td style={{ padding: '12px' }}>{item.title}</td>
                  <td style={{ padding: '12px' }}>
                    {item.tags.map(tag => (
                      <span key={tag} style={{
                        background: '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        margin: '2px',
                        fontSize: '12px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: getStatusColor(item.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {item.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(item.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => onEdit(item)}
                      style={{
                        background: '#1677ff',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginRight: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      style={{
                        background: '#f5222d',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeManagement;
