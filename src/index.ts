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
    for (let storedEvent of eventStore) {
        // The line below may seem strange,
        // but this is the only way I found to avoid
        // `TS2590: Expression produces a union type that is too complex to represent`
        // which drastically increases compile time
        const event = storedEvent[1] as ModuleData<'ready'>;
        args.client.on(storedEvent[0], async (...args) => {
            //@ts-ignore
            if (event.filter && !(await event.filter(...args))) return;
            //@ts-ignore
            event.execute(...args);
        });
    }
    args.client.on('interactionCreate', async interaction => {
        if (interaction.isCommand()) {
            const command = commandStore.find(command => command.commandData.name === interaction.commandName);
            if (!command || (command.filter && !(await command.filter(interaction)))) return;
            command.execute(interaction);
        } else if (interaction.isButton()) {
            buttonStore.forEach(async button => {
                const res = isRegisteredId(button, interaction.customId);
                if (!res.result || (button.filter && !(await button.filter(interaction, res.params)))) return;
                button.execute(interaction, res.params);
            });
        } else if (interaction.isSelectMenu()) {
            selectMenuStore.forEach(async selectMenu => {
                const res = isRegisteredId(selectMenu, interaction.customId);
                if (!res.result || (selectMenu.filter && !(await selectMenu.filter(interaction, res.params)))) return;
                selectMenu.execute(interaction, res.params);
            });
        }
    })
}

export { registerGlobalSlashCommands } from './commands';
