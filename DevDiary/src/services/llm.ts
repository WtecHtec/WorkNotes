import axios from 'axios';
import { Config } from '../config';

export class LLMService {
    private config: Config['llm'];

    constructor(config: Config['llm']) {
        this.config = config;
    }

    async generate(prompt: string, systemPrompt: string = 'You are a helpful assistant.'): Promise<string> {
        try {
            const response = await axios.post(
                `${this.config.baseURL}/chat/completions`,
                {
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt },
                    ],
                    "stream": false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`LLM API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}
