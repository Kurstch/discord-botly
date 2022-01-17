import { Collection } from '@discordjs/collection';
import path from 'path';
import fs from 'fs';
import type { Client, SelectMenuInteraction } from "discord.js";
import type { ModuleData, BotlyModule } from '../typings';
import { isRegisteredId, registerId } from './utils/dynamicId';

const selectMenuInteractions: Collection<string, ModuleData<SelectMenuInteraction>> = new Collection()

export default function initSelectMenuInteractions(client: Client, selectMenuDir: string) {
    const selectMenuFiles = fs.readdirSync(selectMenuDir).filter(file => file.endsWith('.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering select menu interactions:');

    for (const file of selectMenuFiles) {
        const selectMenu = require(path.join(selectMenuDir, file)) as BotlyModule<SelectMenuInteraction>;
        if (typeof selectMenu.execute !== 'function') {
            errors.push(`${file} exports.execute must be a function`);
            continue;
        }
        const res = registerId(file.split('.js')[0]);
        if (res instanceof Error) {
            errors.push(`${file}: ${res.message}`);
            continue;
        }
        selectMenuInteractions.set(file, { ...selectMenu, ...res })
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
        selectMenuInteractions.forEach(selectMenu => {
            const res = isRegisteredId(selectMenu, interaction.customId);
            if (!res.result) return;
            selectMenu.execute(interaction, res.params);
        })
    });
}
