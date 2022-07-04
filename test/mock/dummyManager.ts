import { Collection } from 'discord.js';
import type { FilterFunction } from '../../typings';

export default {
    filters: new Collection<string, FilterFunction<any>>()
};
