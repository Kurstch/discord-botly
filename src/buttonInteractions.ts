import path from 'path';
import fs from 'fs';
import type { Client } from 'discord.js';
import type { RegisteredId } from '../typings';
import { isRegisteredId, registerId } from './utils/dynamicId';

const registeredIds: RegisteredId[] = [];

export default function initButtonInteractions(client: Client, buttonsDir: string) {
    const buttonFiles = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js') && !file.endsWith('.map.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering button interactions:');

    for (const file of buttonFiles) {
        const button = require(path.join(buttonsDir, file));
        if (typeof button.default !== 'function') {
            errors.push(`${file} default export must be a function`);
            continue;
        }
        const res = registerId(file.split('.js')[0], button.default);
        if (res instanceof Error) {
            errors.push(`${file}: ${res.message}`);
            continue;
        }
        registeredIds.push(res, button);
        successes++;
    }

    if (successes > 0) console.info(`Successfully registered ${successes} button interaction${successes > 1 ? 's' : ''}`);
    if (errors.length) {
        console.group(`Failed to register ${errors.length} button interaction${errors.length > 1 ? 's' : ''}:`);
        errors.forEach(err => console.error(err));
        console.groupEnd();
    }
    console.groupEnd();

    client.on('interactionCreate', interaction => {
        if (!interaction.isButton()) return;
        const res = isRegisteredId(registeredIds, interaction.customId);
        if (!res.result) return;
        res.execute(interaction, res.params);
    });
}
