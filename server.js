const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Proxy middleware
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('Error: No URL provided');
    }

    // Parse the target URL
    const parsedUrl = url.parse(targetUrl);
    const target = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // Create a new proxy middleware dynamically
    const proxy = createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
            '^/proxy': '', // Remove "/proxy" from the request path
        },
        onError: (err, req, res) => {
            res.status(500).send('Proxy Error: Unable to fetch the requested URL.');
        }
    });

    proxy(req, res, next);
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
