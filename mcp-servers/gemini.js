const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// const systemPrompts = require('./config/prompts');
const { setGlobalDispatcher, ProxyAgent } = require("undici"); 
const dispatcher = new ProxyAgent({ uri: new URL('http://127.0.0.1:7897').toString() });
setGlobalDispatcher(dispatcher); 

require('dotenv').config();
const { buildSystemPrompt } = require('./utils');
const { parseToolUse } = require('./mcp-tools');

const app = express();
app.use(express.json());

// 初始化 Google AI
// const genAI = new GoogleGenerativeAI('');
const genAI = new GoogleGenerativeAI('');
// 创建聊天模型实例
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}, {
    // baseUrl: 'https://generativelanguage.googleapis.com',
    
});

// 聊天历史管理
const chatHistory = new Map();

// 聊天接口
app.post('/api/chat', async (req, res) => {
    try {
        const { text: message, tools, sessionId = 'default', history = [] } = req.body;
        console.log('message',tools);
        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        // 获取或创建聊天历史
        const chat = model.startChat({
            // history,
            // generationConfig: {
            //   maxOutputTokens: 100,
            // },
          });
   let fullPrompt = buildSystemPrompt(message, tools);
   console.log('fullPrompt',fullPrompt);
        // 生成回复
        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        const callTools = parseToolUse(text, tools);
        console.log('callTools',callTools);
        // 返回回复和更新的会话ID
        res.json({ 
            data: text,
            callTools,
            success: true
        });
    } catch (error) {
        console.error('聊天接口错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 获取可用的系统提示词列表
app.get('/api/prompts', (req, res) => {
    res.json({
        availablePrompts: Object.keys(systemPrompts)
    });
});

// 清除特定会话历史
app.delete('/api/chat/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    if (chatHistory.has(sessionId)) {
        chatHistory.delete(sessionId);
        res.json({ message: '会话历史已清除' });
    } else {
        res.status(404).json({ error: '会话不存在' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});