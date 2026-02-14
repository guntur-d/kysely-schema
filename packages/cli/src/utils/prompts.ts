import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Simple interactive prompts using Node.js built-in readline.
 * No external dependencies needed.
 */

export async function askText(question: string, defaultValue?: string): Promise<string> {
    const rl = readline.createInterface({ input, output });
    const suffix = defaultValue ? ` (${defaultValue})` : '';
    const answer = await rl.question(`  ${question}${suffix}: `);
    rl.close();
    return answer.trim() || defaultValue || '';
}

export async function askYesNo(question: string, defaultYes = true): Promise<boolean> {
    const rl = readline.createInterface({ input, output });
    const hint = defaultYes ? 'Y/n' : 'y/N';
    const answer = await rl.question(`  ${question} (${hint}): `);
    rl.close();
    const normalized = answer.trim().toLowerCase();
    if (normalized === '') return defaultYes;
    return normalized === 'y' || normalized === 'yes';
}

export interface SelectOption {
    label: string;
    value: string;
}

export async function askSelect(question: string, options: SelectOption[]): Promise<string> {
    const rl = readline.createInterface({ input, output });

    console.log(`  ${question}`);
    options.forEach((opt, i) => {
        console.log(`    ${i + 1}) ${opt.label}`);
    });

    let selected: string | undefined;
    while (!selected) {
        const answer = await rl.question(`  Choose (1-${options.length}): `);
        const index = parseInt(answer.trim(), 10) - 1;
        if (index >= 0 && index < options.length) {
            selected = options[index].value;
        } else {
            console.log(`    Please enter a number between 1 and ${options.length}`);
        }
    }

    rl.close();
    return selected;
}
