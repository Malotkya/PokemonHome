import {help as exprt} from "./ExportExcel";
import {help as filter} from "./FilterList";
import {help as find} from "./FindPokemon";

interface HelpInfo {
    name:string,
    args?:string,
    description:string
}

const init = {
    name: "init",
    description: "Initalizes home object."
}

const update = {
    name: "update",
    description: "Updates home object."
}

const list:Array<HelpInfo> = [init, update, exprt, filter, find];



export default function Help():string {
    let output:string = "Current commands:\n";

    let maxLength:number = 0;
    const format = (value:string):string => {
        while(value.length < maxLength)
            value += " ";
        return value;
    }

    list.map((value:HelpInfo)=>{
        let {name, args, description} = value;

        if(typeof name === "undefined")
            return null;

        if(typeof args === "string")
            name = name.concat(" ", args);

        if(name.length > maxLength)
            maxLength = name.length;

        if(typeof description === "string") {
            description = "- ".concat(description);
        } else {
            description = "- No description given!";
        }

        return {name, description};
    }).forEach((value:HelpInfo|null)=>{
        if(value === null)
            return;

        const {name, description} = value;
        output += format(name).concat(" ", description, "\n");
    });

    return output;
}