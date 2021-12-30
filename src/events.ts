import { Client } from "discord.js";
import path from 'path';
import fs from 'fs';

export default function initEvents(client: Client, eventsDir: string) {
    const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));

    // Track successful and failed event registrations
    let successes = 0;
    let errors: string[] = [];

    console.group('\nRegistering events:');
    if (!eventFiles.length) {
        console.info('No events to register');
        console.groupEnd();
        return;
    }

    for (const file of eventFiles) {
        const func = require(path.join(eventsDir, file));
        if (typeof func.default !== 'function') {
            errors.push(`${file} default export must be a function`);
            continue;
        }
        client.on(file.split('.js')[0], func.default);
        successes++;
    }

    if (successes > 0) console.info(`Successfully registered ${successes} event${successes > 1 ? 's' : ''}`);
    if (errors.length) {
        console.group(`Failed to register ${errors.length} event${errors.length > 1 ? 's' : ''}:`);
        errors.forEach(err => console.error(err));
        console.groupEnd();
    }
    console.groupEnd();
}
