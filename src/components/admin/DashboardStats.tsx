import React from 'react';

interface DashboardStatsProps {
  stats: any;
  agentCount: number;
  knowledgeCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, agentCount, knowledgeCount }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>总提交数</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {stats?.overview?.totalSubmissions || 0}
        </div>
      </div>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>活跃用户</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {stats?.overview?.todayActive || 0}
        </div>
      </div>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>在线Agent</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {agentCount}
        </div>
      </div>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>知识库条目</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {knowledgeCount}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
