import { Collection } from 'discord.js';
import type { InitArgs, ModuleData } from "../typings/index";
import type { CommandInteraction, ButtonInteraction, SelectMenuInteraction, ClientEvents } from 'discord.js';
import initModules from './initModules';
import { isRegisteredId } from './utils/dynamicId';

export let eventStore: Collection<string, ModuleData<keyof ClientEvents>> = new Collection();
export let buttonStore: Collection<string, ModuleData<ButtonInteraction>> = new Collection();
export let commandStore: Collection<string, ModuleData<CommandInteraction>> = new Collection();
export let selectMenuStore: Collection<string, ModuleData<SelectMenuInteraction>> = new Collection();

export function init(args: InitArgs) {
    if (args.eventsDir)
        eventStore = initModules<keyof ClientEvents>('event', args.eventsDir);
    if (args.buttonsDir)
        buttonStore = initModules<ButtonInteraction>('button interaction', args.buttonsDir);
    if (args.commandsDir)
        commandStore = initModules<CommandInteraction>('slash command', args.commandsDir);
    if (args.selectMenuDir)
        selectMenuStore = initModules<SelectMenuInteraction>('select menu interaction', args.selectMenuDir);

    // Add event listeners
    for (const [fileName, event] of eventStore) {
        args.client.on(fileName, event.execute);
    }
    args.client.on('interactionCreate', interaction => {
        if (interaction.isCommand()) {
            const command = commandStore.get(interaction.commandName);
            if (!command) return;
            command.execute(interaction);
        } else if (interaction.isButton()) {
            buttonStore.forEach(button => {
                const res = isRegisteredId(button, interaction.customId);
                if (!res.result) return;
                button.execute(interaction, res.params);
            });
        } else if (interaction.isSelectMenu()) {
            selectMenuStore.forEach(selectMenu => {
                const res = isRegisteredId(selectMenu, interaction.customId);
                if (!res.result) return;
                selectMenu.execute(interaction, res.params);
            });
        }
    })
}

export { registerGlobalSlashCommands } from './commands';
