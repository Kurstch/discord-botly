import SlashCommandModule from '../modules/SlashCommandModule';
import BaseManager from './BaseManager';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import type { CommandInteraction } from 'discord.js';
import type { BotlyModule } from '../../typings';

export default class SlashCommandModuleManager extends BaseManager<CommandInteraction, SlashCommandModule> {
    addListener(): void {
        this.client.on('interactionCreate', interaction => {
            if (!interaction.isCommand()) return;
            const module = this.modules.find(module => module.matches(interaction));
            if (module) module.listener(interaction);
        });
    }

    createModule(filepath: string, module: BotlyModule<CommandInteraction>): SlashCommandModule {
        return new SlashCommandModule(this, module.commandData, filepath, module);
    }

    /**
     * Registers all slash commands for every guild the bot is in.
     */
    registerGlobalCommands(): void {
        if (!this.client.isReady()) throw new Error('Client is not logged in');
        const rest = new REST({ version: '9' }).setToken(this.client.token);

        for (const [_, guild] of this.client.guilds.cache) {
            try {
                rest.put(
                    Routes.applicationGuildCommands(this.client.user.id, guild.id),
                    { body: this.modules.map(module => module.commandData.toJSON()) }
                );
                console.log(`> Successfully registered slash commands for guild ${guild.id} (${guild.name})`);
            } catch (error) {
                console.error(`> Failed to register slash commands for guild ${guild.id} (${guild.name})`);
                console.error(error);
            }
        }
    }
}
