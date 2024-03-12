/** /Help
 * 
 * @author Alex Malotky
 */
import {help as exprt} from "./ExportExcel";
import {help as filter} from "./FilterList";
import {help as find} from "./FindPokemon";

/** Help Information Interface
 * 
 */
interface HelpInfo {
    name:string,
    args?:string,
    description:string
}

/** Init Help Information
 * 
 */
const init = {
    name: "init",
    description: "Initalizes home object."
}

/** Update Help Information
 * 
 */
const update = {
    name: "update",
    description: "Updates home object."
}

//List of Help Information
const list:Array<HelpInfo> = [init, update, exprt, filter, find];

/** Generate Help Information String
 * 
 * @returns {string}
 */
export default function Help():string {
    //Output string
    let output:string = "Current commands:\n";

    //Used by format functions
    let nameLength:number = 0;
    let argsLength:number = 0;

    /** Format Info
     * 
     * @param {string} name
     * @param {string} args
     * @returns {string}
     */
    const format = (name:string, args:string = ""):string => {
        while(name.length < nameLength)
            name += " ";

        while(args.length < argsLength)
            args += " ";
        return name.concat(" ", args);
    }

    //Format Information and get Length
    list.map((value:HelpInfo)=>{
        let {name, args, description} = value;

        if(typeof name === "undefined")
            return null;

        if(name.length > nameLength)
            nameLength = name.length;

        if(typeof args === "string" && args.length > argsLength)
            argsLength = args.length;

        if(typeof description === "string") {
            description = "- ".concat(description);
        } else {
            description = "- No description given!";
        }

        return {name, args, description};

    // Convert Information into string
    }).forEach((value:HelpInfo|null)=>{
        if(value === null)
            return;

        const {name, args, description} = value;
        output += format(name, args).concat(" ", description, "\n");
    });

    return output;
}