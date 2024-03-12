import { downloadDex } from './Pokemon/Serebii';
import initHome, {findPositions, Home, PositionResults} from './Pokemon/Home';

export const help = {
    name: "find",
    args: "[name:string]",
    description: "Finds pokemon locations by name."
}

export default async function findPokemon(name:string):Promise<PositionResults> {
    if(typeof name !== "string")
        throw new TypeError("Pokemon Name is not a string!");

    const home:Home = await initHome();
    return findPositions(home, name);
}