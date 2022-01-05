import path from 'path';
import fs from 'fs';
import type { Client } from "discord.js";
import type { RegisteredId } from '../typings';
import { isRegisteredId, registerId } from './utils/dynamicId';

const registeredIds: RegisteredId[] = [];

export default function initSelectMenuInteractions(client: Client, selectMenuDir: string) {
    const selectMenuFiles = fs.readdirSync(selectMenuDir).filter(file => file.endsWith('.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering select menu interactions:');

    for (const file of selectMenuFiles) {
        const selectMenu = require(path.join(selectMenuDir, file));
        if (typeof selectMenu.default !== 'function') {
            errors.push(`${file} default export must be a function`);
            continue;
        }
        const res = registerId(file.split('.js')[0], selectMenu.default);
        if (res instanceof Error) {
            errors.push(`${file}: ${res.message}`);
            continue;
        }
        registeredIds.push(res, selectMenu);
        successes++;
    }

    if (successes > 0) console.info(`Successfully registered ${successes} select menu interaction${successes > 1 ? 's' : ''}`);
    if (errors.length) {
        console.group(`Failed to register ${errors.length} select menu interaction${errors.length > 1 ? 's' : ''}:`);
        errors.forEach(err => console.error(err));
        console.groupEnd();
    }
    console.groupEnd();

    client.on('interactionCreate', interaction => {
        if (!interaction.isSelectMenu()) return;
        const res = isRegisteredId(registeredIds, interaction.customId);
        if (!res.result) return;
        res.execute(interaction, res.params);
    });
}
