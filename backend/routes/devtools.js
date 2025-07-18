const express = require('express');
const router = express.Router();
const vm = require('vm');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// JavaScript execution context
const jsContext = vm.createContext({
    console: {
        log: (...args) => console.log('[JS]', ...args),
        error: (...args) => console.error('[JS]', ...args),
        warn: (...args) => console.warn('[JS]', ...args),
        info: (...args) => console.info('[JS]', ...args)
    },
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    Buffer,
    process: {
        env: process.env,
        platform: process.platform,
        arch: process.arch,
        version: process.version
    },
    global: global
});

// Module cache
const moduleCache = new Map();

// Execute JavaScript code
router.post('/execute', async (req, res) => {
    try {
        const { script, modulesPath, contextId } = req.body;
        
        if (!script) {
            return res.status(400).json({ error: 'Script is required' });
        }
        
        console.log(`🔧 Executing JavaScript (Context: ${contextId || 'default'})`);
        
        // Create execution context
        const executionContext = vm.createContext({
            ...jsContext,
            __contextId: contextId || 'default',
            __modulesPath: modulesPath || './node_modules'
        });
        
        // Execute script
        const result = vm.runInContext(script, executionContext, {
            timeout: 30000, // 30 second timeout
            displayErrors: true
        });
        
        res.json({
            success: true,
            result: result,
            contextId: contextId || 'default'
        });
        
    } catch (error) {
        console.error('JavaScript execution error:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Execute Node.js script with module support
router.post('/node/execute', async (req, res) => {
    try {
        const { script, modulesPath, requireModules } = req.body;
        
        if (!script) {
            return res.status(400).json({ error: 'Script is required' });
        }
        
        console.log('🟢 Executing Node.js script');
        
        // Create temporary file for script
        const tempDir = path.join(__dirname, '../temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const scriptFile = path.join(tempDir, `script_${Date.now()}.js`);
        
        // Add module requires if specified
        let fullScript = '';
        if (requireModules && Array.isArray(requireModules)) {
            for (const module of requireModules) {
                fullScript += `const ${module.name} = require('${module.path}');\n`;
            }
        }
        fullScript += script;
        
        await fs.writeFile(scriptFile, fullScript);
        
        // Execute script
        const execPromise = util.promisify(exec);
        const { stdout, stderr } = await execPromise(`node "${scriptFile}"`, {
            cwd: modulesPath || process.cwd(),
            timeout: 60000 // 60 second timeout
        });
        
        // Clean up
        await fs.unlink(scriptFile);
        
        res.json({
            success: true,
            result: stdout,
            error: stderr || null
        });
        
    } catch (error) {
        console.error('Node.js execution error:', error);
        res.status(500).json({
            error: error.message,
            stdout: error.stdout || null,
            stderr: error.stderr || null
        });
    }
});

// Get available modules
router.get('/modules', async (req, res) => {
    try {
        const { modulesPath } = req.query;
        const targetPath = modulesPath || path.join(process.cwd(), 'node_modules');
        
        console.log(`📁 Scanning modules at: ${targetPath}`);
        
        const modules = [];
        
        try {
            const entries = await fs.readdir(targetPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const packagePath = path.join(targetPath, entry.name, 'package.json');
                    try {
                        const packageData = await fs.readFile(packagePath, 'utf8');
                        const packageJson = JSON.parse(packageData);
                        
                        modules.push({
                            name: entry.name,
                            version: packageJson.version,
                            description: packageJson.description || '',
                            main: packageJson.main || 'index.js',
                            dependencies: packageJson.dependencies || {},
                            devDependencies: packageJson.devDependencies || {}
                        });
                    } catch (err) {
                        // Skip if package.json doesn't exist or is invalid
                        modules.push({
                            name: entry.name,
                            version: 'unknown',
                            description: '',
                            main: 'index.js',
                            dependencies: {},
                            devDependencies: {}
                        });
                    }
                }
            }
        } catch (err) {
            // Directory doesn't exist
            console.log('Modules directory not found');
        }
        
        res.json({
            success: true,
            modules: modules,
            modulesPath: targetPath
        });
        
    } catch (error) {
        console.error('Error scanning modules:', error);
        res.status(500).json({ error: error.message });
    }
});

// Install npm package
router.post('/modules/install', async (req, res) => {
    try {
        const { packageName, version, modulesPath } = req.body;
        
        if (!packageName) {
            return res.status(400).json({ error: 'Package name is required' });
        }
        
        console.log(`📦 Installing package: ${packageName}${version ? '@' + version : ''}`);
        
        const targetPath = modulesPath || process.cwd();
        const packageSpec = version ? `${packageName}@${version}` : packageName;
        
        const execPromise = util.promisify(exec);
        const { stdout, stderr } = await execPromise(`npm install ${packageSpec}`, {
            cwd: targetPath,
            timeout: 300000 // 5 minute timeout
        });
        
        res.json({
            success: true,
            result: stdout,
            error: stderr || null,
            packageName: packageName,
            version: version
        });
        
    } catch (error) {
        console.error('Package installation error:', error);
        res.status(500).json({
            error: error.message,
            stdout: error.stdout || null,
            stderr: error.stderr || null
        });
    }
});

// Debug information
router.get('/debug/info', async (req, res) => {
    try {
        const debugInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            pid: process.pid,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            cwd: process.cwd(),
            env: {
                NODE_ENV: process.env.NODE_ENV,
                PATH: process.env.PATH
            },
            modules: {
                express: require('express/package.json').version,
                vm: 'built-in',
                fs: 'built-in',
                path: 'built-in'
            }
        };
        
        res.json({
            success: true,
            debugInfo: debugInfo
        });
        
    } catch (error) {
        console.error('Error getting debug info:', error);
        res.status(500).json({ error: error.message });
    }
});

// Performance monitoring
router.post('/performance/start', async (req, res) => {
    try {
        const { metrics } = req.body;
        
        console.log('📊 Starting performance monitoring');
        
        // Store performance start time
        global.performanceStartTime = Date.now();
        global.performanceMetrics = metrics || {};
        
        res.json({
            success: true,
            startTime: global.performanceStartTime
        });
        
    } catch (error) {
        console.error('Error starting performance monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/performance/stop', async (req, res) => {
    try {
        console.log('📊 Stopping performance monitoring');
        
        const endTime = Date.now();
        const duration = global.performanceStartTime ? endTime - global.performanceStartTime : 0;
        
        const performanceData = {
            startTime: global.performanceStartTime,
            endTime: endTime,
            duration: duration,
            memoryUsage: process.memoryUsage(),
            metrics: global.performanceMetrics || {}
        };
        
        // Clear global performance data
        delete global.performanceStartTime;
        delete global.performanceMetrics;
        
        res.json({
            success: true,
            performanceData: performanceData
        });
        
    } catch (error) {
        console.error('Error stopping performance monitoring:', error);
        res.status(500).json({ error: error.message });
    }
});

// Console management
router.post('/console/log', async (req, res) => {
    try {
        const { level, message, source, line, column, timestamp } = req.body;
        
        const logLevel = level || 'log';
        const logMessage = `[${logLevel.toUpperCase()}] ${message}`;
        
        if (source) {
            console.log(`${logMessage} (${source}:${line}:${column})`);
        } else {
            console.log(logMessage);
        }
        
        res.json({
            success: true,
            logged: true,
            timestamp: timestamp || Date.now()
        });
        
    } catch (error) {
        console.error('Error logging to console:', error);
        res.status(500).json({ error: error.message });
    }
});

// Network monitoring
router.post('/network/log', async (req, res) => {
    try {
        const { type, url, method, statusCode, headers, body, timestamp } = req.body;
        
        console.log(`🌐 Network ${type}: ${method || 'GET'} ${url} ${statusCode || ''}`);
        
        res.json({
            success: true,
            logged: true,
            timestamp: timestamp || Date.now()
        });
        
    } catch (error) {
        console.error('Error logging network activity:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 