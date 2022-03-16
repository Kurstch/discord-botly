import { Collection } from 'discord.js';
import type { InitArgs, ModuleData } from "../typings/index";
import type { CommandInteraction, ButtonInteraction, SelectMenuInteraction, ClientEvents, Message } from 'discord.js';
import initModules from './initModules';
import { isRegisteredId } from './utils/dynamicId';

export let eventStore: Collection<string, ModuleData<keyof ClientEvents>> = new Collection();
export let buttonStore: Collection<string, ModuleData<ButtonInteraction>> = new Collection();
export let commandStore: Collection<string, ModuleData<CommandInteraction>> = new Collection();
export let selectMenuStore: Collection<string, ModuleData<SelectMenuInteraction>> = new Collection();
export let prefixCommandStore: Collection<string, ModuleData<Message>> = new Collection();

export function init(args: InitArgs) {
    if (args.eventsDir)
        eventStore = initModules<keyof ClientEvents>('event', args.eventsDir);
    if (args.prefixCommandDir && args.prefix)
        prefixCommandStore = initModules<Message>('prefix command', args.prefixCommandDir);
    if (args.buttonsDir)
        buttonStore = initModules<ButtonInteraction>('button interaction', args.buttonsDir);
    if (args.commandsDir)
        commandStore = initModules<CommandInteraction>('slash command', args.commandsDir);
    if (args.selectMenuDir)
        selectMenuStore = initModules<SelectMenuInteraction>('select menu interaction', args.selectMenuDir);

    // Add event listeners
    for (let storedEvent of eventStore) {
        // The line below may seem strange,
        // but this is the only way I found to avoid
        // `TS2590: Expression produces a union type that is too complex to represent`
        // which drastically increases compile time
        const event = storedEvent[1] as ModuleData<'ready'>;
        args.client.on(storedEvent[0], async (...args) => {
            //@ts-ignore
            if (event.filter && !(await event.filter(...args))) {
                //@ts-ignore
                if (event.filterCallback) event.filterCallback(...args);
                return;
            }
            //@ts-ignore
            event.execute(...args);
        });
    }
    args.client.on('messageCreate', async message => {
        if (!message.content.trimStart().startsWith(args.prefix!)) return;

        const parts = message.content.trim().substring(args.prefix!.length).split(' ');
        const command = prefixCommandStore.get(parts[0]);
        const commandArgs = parts.slice(1).filter(s => s.length);

        if (!command) return;
        if (command.filter && !(await command.filter(message, commandArgs))) {
            if (command.filterCallback) command.filterCallback(message, commandArgs);
            return;
        }
        command.execute(message, commandArgs);
    })
    args.client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            const command = commandStore.find(command => command.commandData.name === interaction.commandName);
            if (!command) return;
            if (command.filter && !(await command.filter(interaction))) {
                if (command.filterCallback) command.filterCallback(interaction);
                return;
            }
            command.execute(interaction);
        } else if (interaction.isButton()) {
            buttonStore.forEach(async button => {
                const res = isRegisteredId(button, interaction.customId);
                if (!res.result) return;
                if (button.filter && !(await button.filter(interaction, res.params))) {
                    if (button.filterCallback) button.filterCallback(interaction, res.params);
                    return;
                }
                button.execute(interaction, res.params);
            });
        } else if (interaction.isSelectMenu()) {
            selectMenuStore.forEach(async selectMenu => {
                const res = isRegisteredId(selectMenu, interaction.customId);
                if (!res.result) return;
                if (selectMenu.filter && !(selectMenu.filter(interaction, res.params))) {
                    if (selectMenu.filterCallback) selectMenu.filterCallback(interaction, res.params);
                    return;
                }
                selectMenu.execute(interaction, res.params);
            });
        }
    })
}

export { registerGlobalSlashCommands } from './commands';
