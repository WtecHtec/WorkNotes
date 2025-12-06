import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { configManager } from '../config';
import { PromptManager } from '../utils/prompt';

export function registerConfigCommand(program: Command) {
    program
        .command('config')
        .description('Configure LLM and other settings')
        .option('--baseURL <url>', 'Set LLM API Base URL')
        .option('--key <key>', 'Set LLM API Key')
        .option('--model <model>', 'Set LLM Model')
        .option('--list', 'List current configuration')
        .option('--init-prompts', 'Initialize default prompt files')
        .action(async (options) => {
            // Handle list
            if (options.list) {
                await configManager.load();
                console.log(JSON.stringify(configManager.get(), null, 2));
                return;
            }

            // Handle init-prompts
            if (options.initPrompts) {
                await PromptManager.initDefaults();
                console.log(chalk.green('Default prompts initialized in ~/.dd/prompts/'));
                return;
            }

            // If flags are provided, update config directly
            if (options.baseURL || options.key || options.model) {
                // Load existing or default
                await configManager.load();
                const currentConfig = configManager.get();

                const newConfig = {
                    llm: {
                        ...currentConfig.llm,
                        baseURL: options.baseURL || currentConfig.llm.baseURL,
                        apiKey: options.key || currentConfig.llm.apiKey,
                        model: options.model || currentConfig.llm.model,
                    }
                };

                saveConfig(newConfig);
                console.log(chalk.green('Configuration updated via flags.'));
                return;
            }

            // Interactive mode
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'baseURL',
                    message: 'LLM API Base URL:',
                    default: 'https://api.openai.com/v1',
                },
                {
                    type: 'password',
                    name: 'apiKey',
                    message: 'LLM API Key:',
                },
                {
                    type: 'input',
                    name: 'model',
                    message: 'LLM Model:',
                    default: 'gpt-3.5-turbo',
                },
            ]);

            const newConfig = {
                llm: {
                    baseURL: answers.baseURL,
                    apiKey: answers.apiKey,
                    model: answers.model,
                },
                prompts: {},
                defaults: {
                    branches: ['main', 'master', 'develop']
                }
            };

            saveConfig(newConfig);
            console.log(chalk.green('Configuration saved successfully!'));
        });
}

function saveConfig(config: any) {
    const configPath = path.join(os.homedir(), '.ddrc');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Config written to ${configPath}`);
}
