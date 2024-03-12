/** /Pokemon/Home
 * 
 * @author Alex Malotky
 */
import {getAllRegions} from './Region';
import {downloadDex} from "./Serebii";
import fs from "fs";
import path from "path";

const HOME_FILE_NAME = path.join(process.cwd(), "home.json");

/** Get National Dex
 * 
 * @returns {Array<stirng>}
 */
export async function getNationalDex():Promise<Array<string>> {
    return downloadDex("https://www.serebii.net/pokemon/nationalpokedex.shtml");
}

/** Home Box
 * 
 * List of Pokemon Names
 * Max Lenght of 30
 */
type Box = Array<string>
const MAX_BOX_LENGTH = 30;

/** Region Interface
 * 
 * List of Boxes in a Region
 */
interface Region{
    [name:string]:Box
}

/** Home Interface
 * 
 * List of Regions.
 */
export interface Home {
    [region:string]:Region
}

/** Process All Regions
 * 
 * Uses all the Region Information Downloaded and converts it into a Home Interface
 * 
 * @returns {Home}
 */
async function processAllRegions():Promise<Home>{
    const buffer:Array<{name:string, data:Region}> = [];
    const allRegions = await getAllRegions();
    const natDex:Array<string> = await getNationalDex();

    //Need to go through the list backwords.
    for(let index=allRegions.length-1; index>=0; index--) {
        const region:string = allRegions[index].name;
        const additonal:Array<string> = allRegions[index].special.concat("Teams");

        //Find first pokemon in nat dex.
        const first:string = allRegions[index].first || "undefined";
        const start:number = natDex.indexOf(first);

        if(start === -1)
            throw new Error(`Unable to find first pokemon '${first}' from ${region}!`);
        
        //Seperate dex and aquire data list.
        const splice:Array<string> = natDex.splice(start);
        const data:Array<string> = allRegions[index].getList(splice, natDex);

        //Fill into boxes
        const list:Region = {};
        let count:number = 0;
        while(data.length > 0){
            list[++count] = data.splice(0, MAX_BOX_LENGTH);
        }

        //Create additional boxes.
        for(let name of additonal)
            list[name] = [];

        //Add to buffer.
        buffer.unshift({name:region, data:list});
    }

    //Need to add in correct order.
    const output:Home = {};
    for(const {name, data} of buffer)
        output[name] = data;

    return output;
}

/** Import Home Object from File and Validate
 * 
 * 
 * @returns {Home|null} Null - if any errors occured.
 */
async function importFromFile():Promise<Home|null> {
    //Check if the file exists.
    if(!fs.existsSync(HOME_FILE_NAME))
        return null;

    try {

        //Attempt to Read In File
        const home = JSON.parse(fs.readFileSync(HOME_FILE_NAME).toString());

        //Validate
        if(typeof home !== "object")
            throw new TypeError("Home is not an Object!");

        for(const name in home){
            const region:Region = home[name];
            if(typeof region !== "object")
                throw new TypeError(`${name} is not a Region!`);

            for(const index in region) {
                const box:Box = region[index];

                if(!Array.isArray(box))
                    throw new TypeError(`${name}(${index}) is not a Box!`);

                for(let value of box) {
                    if(typeof value !== "string")
                        throw new TypeError(`${value} in ${name}(${index}) is not a String!`)
                }
            }
        }

        return home;
    } catch (e){

        //Print Error
        console.warn("Home file was corrupted!", e);
        return null;
    }
}

/** Download and Save Home
 * 
 * @returns {Home}
 */
export async function downloadHome():Promise<Home>{
    const home = await processAllRegions();
    fs.writeFileSync(HOME_FILE_NAME, JSON.stringify(home, null, 2));
    return home
}

/** Init Home Object
 * 
 * @returns {Home}
 */
export default async function Home():Promise<Home>{
    let home:Home|null = await importFromFile();

    if(home === null){
        home = await downloadHome();
    }

    return home;
}

//Used to create Position String
const COLUMN_LENGTH = 6;

/**Create Position String
 * 
 * Attempts to create an accurate postion string form the box name and index of box.
 * 
 * @param {string} index 
 * @param {string} box 
 * @returns {string}
 */
function createPositionString(index:string, box:string):string {
    const value:number = Number(index);

    //IF Not A Number return string anyway
    if(isNaN(value))
        return box.concat("-", index);

    //Math to make base0 position
    const row = Math.floor(value/COLUMN_LENGTH);
    const column = value % COLUMN_LENGTH;

    //Return as base1 position.
    return `${box}-${row+1}-${column+1}`;
}

export type FilterResults = Array<Array<string>>;

export function filter(region:Region, list:Array<string>):FilterResults{
    const results:FilterResults = [];
    const ref = list.map(value=>value.toLowerCase());

    for(const name in region) {
        const box = region[name];
        for(const index in box){
            if(ref.includes(box[index].toLowerCase()))
                results.push([box[index], createPositionString(index, name)]);
        }
    }

    return results;
}

export type PositionResults = Array<string>;

/** Find all Positions of Pokemon in Home
 * 
 * @param {Home} home 
 * @param {string} pokemon 
 * @returns {Array<string>}
 */
export function findPositions(home:Home, pokemon:string):PositionResults {
    const results:PositionResults = [];

    for(const r in home) {
        const region:Region = home[r];
        for(const b in region){
            const box:Box = region[b];
            const name:string = r.concat(" ",b);

            for(const index in box) {
                if(box[index].toLowerCase() === pokemon.toLowerCase())
                    results.push(createPositionString(index, name));
            }
        }
    }

    return results;
}