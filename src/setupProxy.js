// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/mipo',
        createProxyMiddleware({
            target: 'https://linkintime.co.in',
            changeOrigin: true,
        })
    );
};
