/**
 * 村智能导游系统 - 后端API服务器
 * 对应前端ADMIN_API_CONFIG配置
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟数据库
let drafts = [];
let submissions = [];
let users = [];
let analytics = [];
let moderationQueue = [];

// === 内容提交API ===
app.post('/api/admin/content/submit', (req, res) => {
  try {
    const contentData = req.body;
    
    // 验证必要字段
    if (!contentData.name || !contentData.type || !contentData.desc) {
      return res.status(400).json({
        success: false,
        error: '缺少必要字段：name, type, desc'
      });
    }

    const newSubmission = {
      id: Date.now().toString(),
      ...contentData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    submissions.push(newSubmission);

    res.json({
      success: true,
      data: newSubmission,
      message: '内容提交成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === 草稿管理API ===

// 获取所有草稿
app.get('/api/admin/drafts', (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  
  let sortedDrafts = [...drafts].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b[sortBy]) - new Date(a[sortBy]);
    }
    return new Date(a[sortBy]) - new Date(b[sortBy]);
  });

  const paginatedDrafts = sortedDrafts.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedDrafts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: drafts.length,
      totalPages: Math.ceil(drafts.length / limit)
    }
  });
});

// 保存草稿
app.post('/api/admin/drafts/save', (req, res) => {
  try {
    const draftData = req.body;
    const newDraft = {
      _id: Date.now().toString(),
      ...draftData,
      createdAt: new Date().getTime()
    };

    drafts.push(newDraft);

    res.json({
      success: true,
      data: newDraft,
      message: '草稿保存成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 删除草稿
app.delete('/api/admin/drafts/delete/:id', (req, res) => {
  try {
    const { id } = req.params;
    drafts = drafts.filter(draft => draft._id !== id);
    
    res.json({
      success: true,
      message: '草稿删除成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 发布草稿
app.post('/api/admin/drafts/publish/:id', (req, res) => {
  try {
    const { id } = req.params;
    const draftIndex = drafts.findIndex(draft => draft._id === id);
    
    if (draftIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '草稿不存在'
      });
    }

    const draft = drafts[draftIndex];
    
    // 转换为正式内容
    const publishedContent = {
      ...draft,
      id: draft._id,
      publishedAt: new Date().toISOString(),
      status: 'published'
    };

    submissions.push(publishedContent);
    drafts.splice(draftIndex, 1);

    res.json({
      success: true,
      data: publishedContent,
      message: '草稿发布成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === 用户管理API ===

// 获取用户列表
app.get('/api/admin/users', (req, res) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  let filteredUsers = users;
  if (status) {
    filteredUsers = users.filter(user => user.status === status);
  }

  let sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b[sortBy]) - new Date(a[sortBy]);
    }
    return new Date(a[sortBy]) - new Date(b[sortBy]);
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

// 更新用户状态
app.put('/api/admin/users/update', (req, res) => {
  try {
    const { userId, status, reason } = req.body;
    
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    users[userIndex].status = status;
    users[userIndex].statusReason = reason;
    users[userIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: users[userIndex],
      message: '用户状态更新成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取用户统计
app.get('/api/admin/users/stats', (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
  }

  const recentUsers = users.filter(user => new Date(user.createdAt) >= startDate);
  
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    banned: users.filter(u => u.status === 'banned').length,
    recent: recentUsers.length,
    timeRange
  };

  res.json({
    success: true,
    data: stats
  });
});

// === 数据统计API ===

// 获取仪表板数据
app.get('/api/admin/analytics/dashboard', (req, res) => {
  const dashboardData = {
    overview: {
      totalSubmissions: submissions.length,
      totalDrafts: drafts.length,
      totalUsers: users.length,
      todayActive: Math.floor(Math.random() * 100) + 50
    },
    contentStats: {
      redCulture: submissions.filter(s => s.type === 'red').length,
      ecology: submissions.filter(s => s.type === 'ecology').length,
      folk: submissions.filter(s => s.type === 'folk').length,
      food: submissions.filter(s => s.type === 'food').length,
      celebrity: submissions.filter(s => s.type === 'celebrity').length
    },
    recentActivity: submissions.slice(-5).reverse().map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      createdAt: s.createdAt
    }))
  };

  res.json({
    success: true,
    data: dashboardData
  });
});

// 获取内容统计
app.get('/api/admin/analytics/content', (req, res) => {
  const { startDate, endDate, contentType } = req.query;
  
  let filteredSubmissions = submissions;
  
  if (contentType) {
    filteredSubmissions = filteredSubmissions.filter(s => s.type === contentType);
  }
  
  if (startDate) {
    filteredSubmissions = filteredSubmissions.filter(s => new Date(s.createdAt) >= new Date(startDate));
  }
  
  if (endDate) {
    filteredSubmissions = filteredSubmissions.filter(s => new Date(s.createdAt) <= new Date(endDate));
  }

  const stats = {
    total: filteredSubmissions.length,
    byType: {
      red: filteredSubmissions.filter(s => s.type === 'red').length,
      ecology: filteredSubmissions.filter(s => s.type === 'ecology').length,
      folk: filteredSubmissions.filter(s => s.type === 'folk').length,
      food: filteredSubmissions.filter(s => s.type === 'food').length,
      celebrity: filteredSubmissions.filter(s => s.type === 'celebrity').length
    },
    byStatus: {
      published: filteredSubmissions.filter(s => s.status === 'published').length,
      pending: filteredSubmissions.filter(s => s.status === 'pending').length,
      rejected: filteredSubmissions.filter(s => s.status === 'rejected').length
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// === 系统配置API ===

// 获取系统配置
app.get('/api/admin/system/config', (req, res) => {
  const config = {
    apiSettings: {
      siliconFlow: {
        enabled: true,
        baseUrl: 'https://api.siliconflow.cn/v1',
        usage: 567,
        limit: 1000
      },
      minimax: {
        enabled: true,
        baseUrl: 'https://api.minimax.chat/v1',
        usage: 234,
        limit: 500
      },
      zhipu: {
        enabled: true,
        baseUrl: 'https://api.zhipuai.cn/api/paas/v4',
        usage: 45,
        limit: 100
      }
    },
    systemSettings: {
      maintenance: false,
      debugMode: false,
      logLevel: 'info'
    }
  };

  res.json({
    success: true,
    data: config
  });
});

// 更新系统配置
app.put('/api/admin/system/update', (req, res) => {
  try {
    const config = req.body;
    
    // 这里应该更新实际的配置文件或数据库
    console.log('更新系统配置:', config);

    res.json({
      success: true,
      message: '系统配置更新成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取系统状态
app.get('/api/admin/system/status', (req, res) => {
  const status = {
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform
    },
    database: {
      connected: true,
      drafts: drafts.length,
      submissions: submissions.length,
      users: users.length
    },
    apis: {
      siliconFlow: { status: 'healthy', responseTime: '120ms' },
      minimax: { status: 'healthy', responseTime: '150ms' },
      zhipu: { status: 'healthy', responseTime: '200ms' }
    }
  };

  res.json({
    success: true,
    data: status
  });
});

// === 文件上传API ===

// 上传单个图片
app.post('/api/admin/upload/image', (req, res) => {
  try {
    // 模拟文件上传处理
    const uploadedFile = {
      url: `https://example.com/uploads/${Date.now()}.jpg`,
      size: Math.floor(Math.random() * 1000000) + 100000,
      dimensions: {
        width: Math.floor(Math.random() * 800) + 400,
        height: Math.floor(Math.random() * 600) + 300
      }
    };

    res.json({
      success: true,
      data: uploadedFile,
      message: '图片上传成功'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === 内容审核API ===

// 获取待审核内容
app.get('/api/admin/moderation/pending', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pendingItems = submissions.filter(s => s.status === 'pending');
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedItems = pendingItems.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: pendingItems.length,
      totalPages: Math.ceil(pendingItems.length / limit)
    }
  });
});

// 批准内容
app.post('/api/admin/moderation/approve/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerNote } = req.body;
    
    const submissionIndex = submissions.findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }

    submissions[submissionIndex].status = 'approved';
    submissions[submissionIndex].reviewedAt = new Date().toISOString();
    submissions[submissionIndex].reviewerNote = reviewerNote;

    res.json({
      success: true,
      data: submissions[submissionIndex],
      message: '内容审核通过'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 拒绝内容
app.post('/api/admin/moderation/reject/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { reason, reviewerNote } = req.body;
    
    const submissionIndex = submissions.findIndex(s => s.id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }

    submissions[submissionIndex].status = 'rejected';
    submissions[submissionIndex].rejectedReason = reason;
    submissions[submissionIndex].reviewedAt = new Date().toISOString();
    submissions[submissionIndex].reviewerNote = reviewerNote;

    res.json({
      success: true,
      data: submissions[submissionIndex],
      message: '内容审核拒绝'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === 健康检查 ===
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// === 静态文件服务 ===
app.use(express.static('public'));

// === 错误处理 ===
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// === 404处理 ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// === 启动服务器 ===
app.listen(PORT, () => {
  console.log(`🚀 村智能导游系统后端API服务器启动成功!`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api/health`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  
  // 初始化一些测试数据
  if (drafts.length === 0) {
    drafts.push({
      _id: 'draft-1',
      name: '测试草稿',
      type: 'ecology',
      desc: '这是一个测试草稿',
      location_desc: '测试位置',
      recommender_name: '测试用户',
      createdAt: Date.now()
    });
  }
  
  if (users.length === 0) {
    users.push({
      id: 'user-1',
      username: 'admin',
      phone: '13800138000',
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }
});

module.exports = app;
