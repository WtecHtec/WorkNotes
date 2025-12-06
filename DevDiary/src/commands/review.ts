import { Command } from 'commander';
import { GitService } from '../services/git';
import { LLMService } from '../services/llm';
import { configManager } from '../config';
import chalk from 'chalk';
import ora from 'ora';
import { PromptManager, DEFAULT_REVIEW_PROMPT } from '../utils/prompt';

export function registerReviewCommand(program: Command) {
    program
        .command('review')
        .description('Analyze code and provide suggestions')
        .option('--staged', 'Review staged changes')
        .option('-b, --branch <branch>', 'Review specific branch')
        .option('-f, --from <date>', 'Start date (YYYY-MM-DD)')
        .option('-t, --to <date>', 'End date (YYYY-MM-DD)')
        .action(async (options) => {
            try {
                await configManager.load();
                const config = configManager.get();

                const gitService = new GitService(process.cwd());
                const llmService = new LLMService(config.llm);

                const spinner = ora('Fetching git diff...').start();

                let diff = '';
                if (options.staged) {
                    diff = await gitService.getDiff({ staged: true });
                } else if (options.branch) {
                    // If from/to are provided, we might want to get logs and diffs for those commits?
                    // Or just diff the branch against something?
                    // Based on user request: "dd review --branch develop --from 2025-12-01 --to 2025-12-07"
                    // This implies reviewing changes in that range.
                    if (options.from && options.to) {
                        // We need to find the commit hashes for these dates on this branch
                        // For simplicity, let's just use the time range diff if git supports it easily, 
                        // or we can just ask git log for the range and then diff the first and last commit?
                        // Actually `git diff start_date end_date` isn't direct.
                        // We can use `git log` to get the first and last commit hash in that range.

                        const logs = await gitService.getLogs({
                            from: options.from,
                            to: options.to,
                            branches: [options.branch]
                        });

                        if (logs.length >= 2) {
                            const first = logs[logs.length - 1].hash;
                            const last = logs[0].hash;
                            diff = await gitService.getDiff({ from: first, to: last });
                        } else if (logs.length === 1) {
                            // Only one commit, diff against its parent?
                            diff = await gitService.getDiff({ from: `${logs[0].hash}^`, to: logs[0].hash });
                        } else {
                            spinner.fail('No commits found in the specified range.');
                            return;
                        }
                    } else {
                        // Just diff the branch tip against main? Or just show the branch content?
                        // Let's assume diff against default branch (e.g. main) if no range.
                        // Or maybe just fail if no range provided for now, as "review branch" is ambiguous.
                        // Let's try to diff against 'main' or 'master' as a fallback.
                        const branches = await gitService.getAllBranches();
                        const mainBranch = branches.includes('main') ? 'main' : 'master';
                        diff = await gitService.getDiff({ from: mainBranch, to: options.branch });
                    }
                } else {
                    // Default to staged if nothing else?
                    diff = await gitService.getDiff({ staged: true });
                }

                if (!diff) {
                    spinner.warn('No changes detected to review.');
                    return;
                }

                // Truncate diff if too large to avoid token limits (naive approach)
                if (diff.length > 10000) {
                    diff = diff.substring(0, 10000) + '\n... (truncated)';
                }

                spinner.succeed('Diff retrieved.');

                let promptTemplate = await PromptManager.load('review', DEFAULT_REVIEW_PROMPT);
                const prompt = promptTemplate.replace('{{diff}}', diff);

                spinner.start('Analyzing code with LLM...');
                const review = await llmService.generate(prompt, 'You are a senior software engineer conducting a code review.');
                spinner.succeed('Review complete!');

                console.log('\n' + chalk.magenta('--- Code Review ---') + '\n');
                console.log(review);

            } catch (error: any) {
                console.error(chalk.red('Error conducting review:'), error.message);
            }
        });
}
