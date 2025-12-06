import React from 'react';

interface UserStats {
  id: string;
  username: string;
  phone: string;
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  requestCount: number;
}

interface UserManagementProps {
  users: UserStats[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#52c41a';
      case 'inactive':
        return '#faad14';
      case 'banned':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '非活跃';
      case 'banned': return '封禁';
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
      <h3 style={{ marginBottom: '16px' }}>用户统计 (D哥)</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>用户名</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>手机号</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>状态</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>最后登录</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>请求次数</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px' }}>{user.username}</td>
                <td style={{ padding: '12px' }}>{user.phone}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: getStatusColor(user.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{new Date(user.lastLogin).toLocaleString()}</td>
                <td style={{ padding: '12px' }}>{user.requestCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
