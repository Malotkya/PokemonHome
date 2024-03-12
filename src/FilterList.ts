import xlsx from 'node-xlsx';
import { downloadDex } from './Pokemon/Serebii';
import initHome, {Home, filter} from './Pokemon/Home';

export const help = {
    name: "filter",
    args: "[uri:string] [target:string = 'filter.xlsx']",
    description: "Filters pokedex into Regions wihin Home."
}

export default async function filterList(uri:string):Promise<Buffer> {
    if(typeof uri !== "string")
        throw new TypeError("URI is not a string!");


    const dex:Array<string> = await downloadDex(uri);
    const home:Home = await initHome();
    const options:any = {};

    const output:Array<{name:string, data:Array<Array<string>>, options:{}}> = [];

    for(let name in home) {
        output.push({name, options, data:filter(home[name], dex)});
    }

    return xlsx.build(output);
}