import Help from "./Help";
import exportToExcel from "./ExportExcel";
import filterList from "./FilterList";
import findPokemon from "./FindPokemon";
import {downloadHome} from "./Pokemon/Home";
import fs from "fs";

switch(process.argv[2]){
    case "export":
        exportToExcel(process.argv[4])
            .then(buffer=>{
                const target:string = process.argv[3] || "export.xlsx";
                fs.writeFileSync(target, buffer);
            }).catch(console.error);
    break;

    case "filter":
        filterList(process.argv[3])
            .then(buffer=>{
                const target:string = process.argv[4] || "filter.xlsx";
                fs.writeFileSync(target, buffer)
            }).catch(console.error);
            
    break;

    case "find":
        findPokemon(process.argv[3])
            .then(results=>{
                if(results.length === 0) {
                    console.log("No results found!");
                } else {
                    for(const pos of results)
                        console.log(pos);
                }
            }).catch(console.error);
    break;

    case "update":
        downloadHome()
            .then(()=>console.log("Update Complete!"))
            .catch(console.error);
    break;

    case "help":
        console.log(Help());
    break;

    default:
        console.error("Unknown process!");
}