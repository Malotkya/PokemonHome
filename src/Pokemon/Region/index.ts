/** /Pokemon/Region
 * 
 * @author Alex Malotky
 */
import { downloadDex } from "../Serebii";
import {sleep} from "../../util";

//All Region Information
import * as Kanto from "./Kanto";
import * as Johto from "./Johto";
import * as Hoenn from "./Hoenn";
import * as Sinnoh from "./Sinnoh";
import * as Unova from "./Unova";
import * as Kalos from "./Kalos";
import * as Alola from "./Alola";
import * as Galar from "./Galar";
import * as Hisui from "./Hisui";
import * as Paldea from "./Paldea";

/** Region Class
 * 
 */
export default class Region {
    private _name:string;
    private _dex:Array<string>|undefined;
    private _variants:Array<string>|undefined;
    private _first:string|undefined;
    private _special:Array<string>;

    /** Constructor
     * 
     * Uses await this.init() to make sure that everything is done downloading and initalizing.
     * 
     * @param {stirng} name 
     * @param {stirng|Array<string>} dexURI 
     * @param {Array<string>|string} variants - assumes uri if string
     * @param {string} first 
     * @param {Array<string>} special 
     */
    constructor(name:string, dexURI:string|Array<string>, variants?:Array<string>|string, first?:string, special:Array<string> = []){
        this._name = name;

        //Download the pokedex.
        downloadDex(dexURI).then(list =>{
            this._dex = list;
        }).catch(e=>{
            this._dex = [];
            console.error(`There was an issue getting the dex for ${name}!\n`, e);
        });

        if(Array.isArray(variants)){
            this._variants = variants;
        } else if(typeof variants === "string"){
            //Download Variants.
            downloadDex(variants).then(list =>{
                this._variants = list;
            }).catch(e=>{
                this._variants = [];
                console.error(`There was an issue getting the variants for ${name}!\n`, e);
            })
        } else {
            this._variants = [];
        }

        this._first = first;
        this._special = special;
    }

    /** Release on init.
     * 
     */
    async init() {
        while(this._dex === undefined || this._variants === undefined)
            await sleep();
    }

    /** Get Name
     * 
     */
    get name():string {
        return this._name;
    }

    /** Get Pokedex
     * 
     */
    get dex():Array<string> {
        if(this._dex)
            return this._dex;

        return [];
    }

    /** Get Variants List
     * 
     */
    get variants():Array<string> {
        if(this._variants)
            return this._variants;

        return [];
    }

    /** Get Special List
     * 
     */
    get special():Array<string> {
        return this._special;
    }

    /** Get First Pokemon in National Dex.
     * 
     */
    get first():string|undefined{
        if(this._first)
            return this._first;

        return this.dex[0];
    }

    /** Get Region Home List
     * 
     * @param {Array<string>} dexChunk - contains pokemon in region.
     * @param {Array<string>} natDex - pokemon remianing.
     * @returns 
     */
    getList(dexChunk:Array<string>, natDex:Array<string>):Array<string> {
        let everything:Set<string> = new Set(dexChunk.concat(this.dex))

        return Array.from(everything)
            .filter(value => {
                if(this.variants.includes(value))
                    return true;

                if(this.special.includes(value))
                    return false;

                return !natDex.includes(value);
            }).sort((a,b)=>{
                let lhs:number = this.dex.indexOf(a);
                if(lhs === -1)
                    lhs = this.dex.length + natDex.indexOf(a);

                let rhs:number = this.dex.indexOf(b);
                if(rhs === -1)
                    rhs = this.dex.length + natDex.indexOf(b);

                return lhs - rhs;
            });
    }
}

/** Region Data Interface
 * 
 */
interface RegionData {
    name:string,
    dex:string|Array<string>,
    variants?:Array<string>|string,
    first?:string,
    special?:Array<string>
}

/** Initialize Region
 * 
 * Creates region and then waits for it to finish initalizing.
 * 
 * @param {ReginoData} data 
 * @returns {Region}
 */
export async function initRegion(data:RegionData):Promise<Region>{
    console.debug(`Initializing ${data.name} Region.`);
    const region = new Region(data.name, data.dex, data.variants, data.first, data.special);
    
    await region.init();
    return region;
}

/** Get All Regions
 * 
 * @returns {Array<Region>}
 */
export async function getAllRegions():Promise<Array<Region>> {
    const output:Array<Region> = [];
    return [
        await initRegion(Kanto),
        await initRegion(Johto),
        await initRegion(Hoenn),
        await initRegion(Sinnoh),
        await initRegion(Unova),
        await initRegion(Kalos),
        await initRegion(Alola),
        await initRegion(Galar),
        await initRegion(Hisui),
        await initRegion(Paldea)
    ]
}