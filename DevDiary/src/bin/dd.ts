#!/usr/bin/env node
import { program } from 'commander';
import { registerReportCommand } from '../commands/report';
import { registerReviewCommand } from '../commands/review';
import { registerConfigCommand } from '../commands/config';

program
    .version('1.0.0')
    .description('DevDiary (dd) - Automated weekly reports and code reviews');

registerReportCommand(program);
registerReviewCommand(program);
registerConfigCommand(program);

program.parse(process.argv);
