import { Command } from 'commander';
import { GitService } from '../services/git';
import { LLMService } from '../services/llm';
import { configManager } from '../config';
import chalk from 'chalk';
import ora from 'ora';
import { PromptManager, DEFAULT_REPORT_PROMPT } from '../utils/prompt';

export function registerReportCommand(program: Command) {
    program
        .command('report')
        .description('Generate weekly report')
        .option('-u, --user <user>', 'Filter by user')
        .option('-f, --from <date>', 'Start date (YYYY-MM-DD)')
        .option('-t, --to <date>', 'End date (YYYY-MM-DD)')
        .option('-b, --branch <branch>', 'Specific branch')
        .option('--branches <branches>', 'Comma-separated list of branches')
        .option('--all-branches', 'Include all branches')
        .action(async (options) => {
            try {
                await configManager.load();
                const config = configManager.get();

                const gitService = new GitService(process.cwd());
                const llmService = new LLMService(config.llm);

                const user = options.user || config.defaults.user;
                const from = options.from; // TODO: Default to 7 days ago if not provided
                const to = options.to || new Date().toISOString().split('T')[0];

                if (!from) {
                    console.error(chalk.red('Please provide a start date with --from'));
                    return;
                }

                let branches: string[] = [];
                if (options.allBranches) {
                    branches = ['--all'];
                } else if (options.branches) {
                    branches = options.branches.split(',');
                } else if (options.branch) {
                    branches = [options.branch];
                } else if (config.defaults.branches) {
                    branches = config.defaults.branches;
                }

                const spinner = ora('Fetching git logs...').start();
                const logs = await gitService.getLogs({
                    from,
                    to,
                    author: user,
                    branches
                });
                spinner.succeed(`Found ${logs.length} commits.`);

                if (logs.length === 0) {
                    console.log(chalk.yellow('No commits found for the specified criteria.'));
                    return;
                }

                // Prepare prompt
                const commitsText = logs.map(l => `- [${l.date.substring(0, 10)}] ${l.message} (${l.hash.substring(0, 7)})`).join('\n');

                let promptTemplate = await PromptManager.load('report', DEFAULT_REPORT_PROMPT);
                const prompt = promptTemplate
                    .replace('{{user}}', user || 'Unknown')
                    .replace('{{from}}', from)
                    .replace('{{to}}', to)
                    .replace('{{commits}}', commitsText);

                spinner.start('Generating report with LLM...');
                console.log(prompt)
                const report = await llmService.generate(prompt, '你是一位能干的技术助理，负责生成每周报告. ');
                spinner.succeed('Report generated!');

                console.log('\n' + chalk.cyan('--- Weekly Report ---') + '\n');
                console.log(report);

            } catch (error: any) {
                console.error(chalk.red('Error generating report:'), error.message);
            }
        });
}
