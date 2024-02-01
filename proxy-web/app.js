const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');
const url = require('url');
const app = express();

const targetUrl = 'https://luckcar.top/flexgame/';

function replaceRelativeUrls(html, baseUrl) {
    return html.replace(/(href|src)="(?!http)([^"]+)"/g, (match, attr, src) => {
        const absoluteUrl = url.resolve(baseUrl, src);
        return `${attr}="${absoluteUrl}"`;
    });
}

const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: (proxyRes, req, res) => {
        const contentType = proxyRes.headers['content-type'] || '';

        if (contentType.includes('text/html')) {
            let bodyChunks = [];

            proxyRes.on('data', (chunk) => {
                bodyChunks.push(chunk);
            });

            proxyRes.on('end', () => {
                const bodyBuffer = Buffer.concat(bodyChunks);

                if (proxyRes.headers['content-encoding'] === 'gzip') {
                    zlib.gunzip(bodyBuffer, (err, decodedBuffer) => {
                        if (err) {
                            res.status(500).send('Error decompressing response');
                        } else {
                            const modifiedBody = replaceRelativeUrls(decodedBuffer.toString(), targetUrl)
                                .replace('</head>', '<style>h1[class="title"] { display: none; }</style></head>');

                            zlib.gzip(modifiedBody, (err, compressedBuffer) => {
                                if (err) {
                                    res.status(500).send('Error compressing response');
                                } else {
                                    res.set('Content-Encoding', 'gzip');
                                    res.send(compressedBuffer);
                                }
                            });
                        }
                    });
                    console.log('gzip')
                } else {
                    console.log('no gzip')
                    const modifiedBody = replaceRelativeUrls(bodyBuffer.toString(), targetUrl)
                        .replace('</head>', '<style>h1[class="title"] { display: none; }</style></head>');

                    res.send(modifiedBody);
                }
            });
        } else {
            // 非 HTML 内容直接通过代理返回
            proxyRes.pipe(res);
        }
    },
});

app.use('/', proxy);

app.listen(3000, () => {
    console.log('Node.js proxy server listening on port 3000');
});