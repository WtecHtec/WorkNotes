import simpleGit, { SimpleGit, LogOptions } from 'simple-git';

export class GitService {
    private git: SimpleGit;

    constructor(baseDir?: string) {
        this.git = simpleGit(baseDir);
    }

    async getLogs(options: {
        from: string;
        to: string;
        author?: string;
        branches?: string[];
    }) {
        const logOptions: any = {
            '--no-merges': null,
            '--since': options.from,
            '--until': options.to,
        };

        if (options.author) {
            logOptions['--author'] = options.author;
        }

        // If branches are specified, we might need to fetch them or just pass them to log
        // simple-git log accepts an array of arguments or options object.
        // To search across branches, we usually need to pass the branch names as arguments.

        // However, simple-git's log interface is a bit specific.
        // Let's use the raw listLog or just pass arguments carefully.

        const args = ['--no-merges', `--since=${options.from}`, `--until=${options.to}`];
        if (options.author) {
            args.push(`--author=${options.author}`);
        }

        if (options.branches && options.branches.length > 0) {
            // If "all" is not one of them, we append branches.
            // If user wants all branches, they might pass '--all'
            args.push(...options.branches);
        } else {
            // Default to HEAD if no branches specified? Or maybe current branch.
            // If we want "all branches" logic, we might need --all
        }

        // We need to handle the case where we want to log from multiple branches.
        // git log branch1 branch2 ...

        try {
            const logs = await this.git.log(args);
            return logs.all;
        } catch (e) {
            console.error('Error fetching git logs:', e);
            return [];
        }
    }

    async getDiff(options: { staged?: boolean; branch?: string; from?: string; to?: string }) {
        if (options.staged) {
            return this.git.diff(['--staged']);
        }

        if (options.from && options.to) {
            return this.git.diff([`${options.from}..${options.to}`]);
        }

        if (options.branch) {
            // Diff against a branch? Or show changes in a branch?
            // Usually "review a branch" means diffing it against main or develop.
            // For now, let's assume it means diffing HEAD against that branch, or that branch against its parent?
            // Let's stick to the requested "review --branch develop --from ... --to ..." logic which implies time range on a branch.
            // But if it's just "review --branch develop", maybe it means "what's in develop that's not in main"?
            // The user requirement says: "dd review --branch develop --from 2025-12-01 --to 2025-12-07"
            // This sounds like "show me the diff of commits on develop in this time range".
            // This is tricky because diff is between two points. 
            // Maybe it means "diff between the commit at start date and commit at end date on this branch".

            // For now, let's support explicit range diff if provided.
            return '';
        }

        return '';
    }

    async getAllBranches() {
        const branchSummary = await this.git.branch();
        return branchSummary.all;
    }
}
