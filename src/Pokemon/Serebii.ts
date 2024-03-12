/** /Pokmeon/Serebii
 * 
 * @author Alex Malotky
 */
import {fetch} from '../util';
import {JSDOM, DOMWindow} from 'jsdom';

/** Download HTML at Create Window
 * 
 * @param {string} url 
 * @returns {Window}
 */
async function downloadHTML(url:string):Promise<DOMWindow>{
    const body:string = await fetch(url);
    return new JSDOM(body).window;
}

/** FInd Name Index
 * 
 * Index of name or -1 if it can't find it.
 * 
 * @param {NodeList} row 
 * @returns {number}
 */
function findNameIndex(row:NodeListOf<HTMLElement>):number {
    for(let index=0; index<row.length; index++){
        if(row[index].textContent?.toLowerCase().includes("name"))
            return index;
    }

    return -1;
}

/** Find Table with Pokemon
 * 
 * table: null - table was not found
 *        NodeList - list of rows
 * 
 * index: location of name column
 *        -1 - column not found
 * 
 * @param {Document} document 
 * @returns {
 *      table: NodeList|null,
 *      index:number
 *   }
 */
function findTable(document:Document):{table:NodeListOf<HTMLElement>|null, index:number} {
    const list: NodeListOf<HTMLTableElement> = document.querySelectorAll("table");

    for(let test of list){
        const table = test.querySelectorAll("tr");
        if(table.length > 0) {
            const index:number = findNameIndex(table[0].querySelectorAll("td"));
            if(index !== -1)
                return {table, index};
        }
    }
    
    return {table:null, index:-1};
}

/** Get Name From Columns
 * 
 * Returns: null if the name was not found.
 *          "empty" if the name was found but empty.
 * 
 * @param {HTMLCollection} columns 
 * @param {number} index 
 * @returns {string|null}
 */
function getName(columns:HTMLCollection, index:number):string|null {
    if(index >= columns.length)
        return null;

    const target = columns[index];

    if(target.classList.contains("cen") || target.classList.contains("fooinfo")){
        const name = (target.textContent || "empty").match(/[\x00-\x7F♀♂]+/);
        if(name)
            return name[0].trim();
    }

    return null;
}

/** Download Single Pokedex
 * 
 * @param {string} url 
 * @returns {Array<String>}
 */
async function downloadSingleDex(url:string):Promise<Array<string>>{
    const list: Array<string> = [];
    const {document} = await downloadHTML(url);
    const {table, index} = findTable(document);

    if(table === null)
        throw new Error("Unable to find table!");

    for(let row of table){
        const name = getName(row.children, index);
        if(name !== null)
            list.push(name);
    }

    return list;
}

/** Download Pokedex
 * 
 * Download a Pokedex from mulitple locations.
 * 
 * @param {string|Array<string>} data 
 * @returns {Array<string>}
 */
export async function downloadDex(data:string|Array<string>):Promise<Array<string>>{
    if(typeof data === "string")
        return downloadSingleDex(data);

    let list: Array<string> = [];
    for(let url of data){
        try {
            list = list.concat(await downloadSingleDex(url));
        } catch (e:any){
            const message = e.message || "An unknown error occured!";
            throw new Error(`Downloading from '${url}' encountered:\n${message}`);
        }
        
    }
    return list;
}