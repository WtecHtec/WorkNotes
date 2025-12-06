import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import os from 'os';

export interface Config {
    llm: {
        baseURL: string;
        apiKey: string;
        model: string;
    };
    prompts: {
        report?: string;
        review?: string;
    };
    defaults: {
        user?: string;
        branches?: string[];
    };
}

const defaultConfig: Config = {
    llm: {
        baseURL: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-3.5-turbo',
    },
    prompts: {},
    defaults: {
        branches: ['main', 'master', 'develop'],
    },
};

export class ConfigManager {
    private config: Config;

    constructor() {
        this.config = { ...defaultConfig };
    }

    async load() {
        const explorer = cosmiconfig('dd');

        // Check local config first
        const localResult = await explorer.search();

        // Check global config if no local config or to merge? 
        // Usually we want to merge. Let's try to load global specifically if needed, 
        // but cosmiconfig searches up. 
        // For simplicity, let's assume standard cosmiconfig behavior + optional global file check.

        // Let's explicitly check home directory if local search didn't find anything or just to merge.
        // A simple approach: load global, then load local, then merge.

        const globalConfigPath = path.join(os.homedir(), '.ddrc');
        const globalResult = await explorer.load(globalConfigPath).catch(() => null);

        if (globalResult && !globalResult.isEmpty) {
            this.merge(globalResult.config);
        }

        if (localResult && !localResult.isEmpty) {
            this.merge(localResult.config);
        }
    }

    merge(newConfig: Partial<Config>) {
        this.config = {
            ...this.config,
            ...newConfig,
            llm: { ...this.config.llm, ...newConfig.llm },
            prompts: { ...this.config.prompts, ...newConfig.prompts },
            defaults: { ...this.config.defaults, ...newConfig.defaults },
        };
    }

    get(): Config {
        return this.config;
    }
}

export const configManager = new ConfigManager();
