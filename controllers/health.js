const mongoose = require('mongoose');
const os = require('os');

// Health check controller
const healthCheck = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbLatency = await checkDatabaseLatency();
    
    // System information
    const systemInfo = {
      uptime: process.uptime(),
      memory: {
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024)
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      platform: os.platform(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // API response time
    const responseTime = Date.now() - startTime;

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      system: systemInfo,
      version: process.env.APP_VERSION || '1.0.0'
    };

    // Determine overall health status
    const isHealthy = dbStatus === 'connected' && responseTime < 1000;
    
    res.status(isHealthy ? 200 : 503).json({
      ...healthData,
      status: isHealthy ? 'healthy' : 'unhealthy'
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message
    });
  }
};

// Detailed health check
const detailedHealthCheck = async (req, res) => {
  try {
    const checks = {
      database: await checkDatabaseHealth(),
      memory: await checkMemoryHealth(),
      disk: await checkDiskHealth(),
      api: await checkApiHealth()
    };

    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    });

  } catch (error) {
    console.error('Detailed health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
      message: error.message
    });
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        latency: null
      };
    }

    // Test a simple query
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      message: 'Database connection successful',
      latency: `${latency}ms`
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      error: error.message,
      latency: null
    };
  }
};

// Memory health check
const checkMemoryHealth = () => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;

    return {
      status: memoryUsage < 90 ? 'healthy' : 'warning',
      message: `Memory usage: ${memoryUsage.toFixed(2)}%`,
      details: {
        used: Math.round(usedMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        total: Math.round(totalMem / 1024 / 1024),
        percentage: memoryUsage.toFixed(2)
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Memory health check failed',
      error: error.message
    };
  }
};

// Disk health check (basic)
const checkDiskHealth = () => {
  try {
    // This is a basic check - in production you might want to use a library like 'diskusage'
    return {
      status: 'healthy',
      message: 'Disk health check passed',
      note: 'Detailed disk check requires additional libraries'
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Disk health check failed',
      error: error.message
    };
  }
};

// API health check
const checkApiHealth = () => {
  try {
    const uptime = process.uptime();
    const loadAverage = os.loadavg()[0]; // 1-minute load average

    return {
      status: 'healthy',
      message: 'API is running',
      details: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        loadAverage: loadAverage.toFixed(2),
        nodeVersion: process.version
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'API health check failed',
      error: error.message
    };
  }
};

// Check database latency
const checkDatabaseLatency = async () => {
  try {
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    return Date.now() - startTime;
  } catch (error) {
    return null;
  }
};

module.exports = {
  healthCheck,
  detailedHealthCheck
}; 