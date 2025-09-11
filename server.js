const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.json': 'application/json'
};

// Helper function to serve files
function serveFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(200, { 
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=3600'
        });
        res.end(data);
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Handle directory requests by adding index.html
    if (pathname.endsWith('/') && pathname !== '/') {
        pathname = pathname + 'index.html';
    }

    // Construct file path
    const filePath = path.join(__dirname, pathname);
    
    // Check if path is a directory and try to serve index.html
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isDirectory()) {
            const indexPath = path.join(filePath, 'index.html');
            fs.access(indexPath, fs.constants.F_OK, (indexErr) => {
                if (!indexErr) {
                    return serveFile(indexPath, res);
                } else {
                    // Directory exists but no index.html
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(get404Page(pathname));
                }
            });
        } else {
            // Check if file exists
            fs.access(filePath, fs.constants.F_OK, (accessErr) => {
                if (accessErr) {
                    // File not found
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(get404Page(pathname));
                } else {
                    // File exists, serve it
                    serveFile(filePath, res);
                }
            });
        }
    });
});

// Helper function to generate 404 page
function get404Page(pathname) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Not Found</title>
            <style>
                body {
                    font-family: 'MS Sans Serif', sans-serif;
                    background: #008080;
                    color: white;
                    text-align: center;
                    padding: 50px;
                }
                .error-window {
                    background: #c0c0c0;
                    color: black;
                    border: 2px solid;
                    border-color: #dfdfdf #808080 #808080 #dfdfdf;
                    padding: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                }
                .error-header {
                    background: #000080;
                    color: white;
                    margin: -20px -20px 20px -20px;
                    padding: 8px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="error-window">
                <div class="error-header">Error - File Not Found</div>
                <p><strong>404 - Page Not Found</strong></p>
                <p>The file "${pathname}" could not be found on this server.</p>
                <button onclick="history.back()" style="
                    background: #c0c0c0;
                    border: 2px solid;
                    border-color: #dfdfdf #808080 #808080 #dfdfdf;
                    padding: 4px 12px;
                    cursor: pointer;
                ">Go Back</button>
            </div>
        </body>
        </html>
    `;
}

// Start the server
const PORT = 3001;
const HOST = '0.0.0.0'; // Listen on all interfaces

server.listen(PORT, HOST, () => {
    console.log(`🖥️  Midas's Win95 Homepage Server is running!`);
    console.log(`📍 Local access: http://localhost:${PORT}`);
    console.log(`🌐 External access: http://midas.opsignalplus.com`);
    console.log(`⚡ Server listening on ${HOST}:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('');
    console.log('🎉 Welcome to the nostalgic world of Windows 95!');
    console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n💾 Shutting down server gracefully...');
    server.close(() => {
        console.log('🔴 Server stopped. Thanks for visiting!');
        process.exit(0);
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error('Please stop any other services running on this port or choose a different port.');
    } else {
        console.error('❌ Server error:', err.message);
    }
    process.exit(1);
});

// Log requests (optional, for debugging)
server.on('request', (req, res) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`);
});