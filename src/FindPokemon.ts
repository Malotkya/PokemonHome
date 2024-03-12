import { downloadDex } from './Pokemon/Serebii';
import initHome, {findPositions, Home, PositionResults} from './Pokemon/Home';

export default async function findPokemon(name:string):Promise<PositionResults> {
    if(typeof name !== "string")
        throw new TypeError("Pokemon Name is not a string!");

    const home:Home = await initHome();
    return findPositions(home, name);
}