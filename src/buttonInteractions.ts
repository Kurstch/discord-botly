import { Collection } from '@discordjs/collection';
import path from 'path';
import fs from 'fs';
import type { ButtonInteraction, Client } from 'discord.js';
import type { BotlyModule, ModuleData } from '../typings';
import { isRegisteredId, registerId } from './utils/dynamicId';

const buttonInteractions: Collection<string, ModuleData<ButtonInteraction>> = new Collection()

export default function initButtonInteractions(client: Client, buttonsDir: string) {
    const buttonFiles = fs.readdirSync(buttonsDir).filter(file => file.endsWith('.js') && !file.endsWith('.map.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering button interactions:');

    for (const file of buttonFiles) {
        const button = require(path.join(buttonsDir, file)) as BotlyModule<ButtonInteraction>;
        if (typeof button.execute !== 'function') {
            errors.push(`${file} exports.execute must be a function`);
            continue;
        }
        const res = registerId(file.split('.js')[0]);
        if (res instanceof Error) {
            errors.push(`${file}: ${res.message}`);
            continue;
        }
        buttonInteractions.set(file, { ...button, ...res })
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
        buttonInteractions.forEach(button => {
            const res = isRegisteredId(button, interaction.customId);
            if (!res.result) return;
            button.execute(interaction, res.params);
        })
    });
}
