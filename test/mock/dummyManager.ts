import { Collection } from 'discord.js';
import type { CatchFunction, FilterFunction } from '../../typings';

export default {
    filters: new Collection<string, FilterFunction<any>>(),
    catchers: new Collection<string, CatchFunction<any>>()
};
