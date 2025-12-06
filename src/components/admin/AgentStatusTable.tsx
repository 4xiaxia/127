import React from 'react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  lastHeartbeat: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface AgentStatusTableProps {
  agents: AgentStatus[];
}

const AgentStatusTable: React.FC<AgentStatusTableProps> = ({ agents }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#52c41a';
      case 'offline':
        return '#faad14';
      case 'error':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'error': return '错误';
      default: return status;
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginBottom: '16px' }}>Agent健康状态</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>Agent名称</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>响应时间</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>请求次数</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>错误率</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>最后心跳</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>{agent.name}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: getStatusColor(agent.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {getStatusText(agent.status)}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{agent.responseTime > 0 ? `${agent.responseTime}ms` : '-'}</td>
                <td style={{ padding: '12px' }}>{agent.requestCount}</td>
                <td style={{ padding: '12px' }}>{(agent.errorRate * 100).toFixed(2)}%</td>
                <td style={{ padding: '12px' }}>{new Date(agent.lastHeartbeat).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentStatusTable;
