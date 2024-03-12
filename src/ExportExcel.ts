import xlsx, {BuildOptions} from 'node-xlsx';
import initHome, {Home} from './Pokemon/Home';

export const help = {
    name: "export",
    args: "[firstBox:number = 1] [target:string = 'export.xlsx']",
    description: "Exports home information to excel spreadsheet."
}

const MAX_COLUMNS = 6;
const MAX_ROWS = 5;
const HEADERS = ["Name:", "Box Name", "Position"];

function createOptions(data:Home):BuildOptions {
    let width1: number = 0, width2:number = 0;
    for(let region in data){

        for(let index in data[region]) {
            const name = region+index+" ";
            if(width2 < name.length)
                width2 = name.length;

            for(let value of data[region][index]){
                if(width1 < value.length)
                    width1 = value.length;
            }
        }
    }

    return {
        '!cols': [
            {wch: width1+1},
            {wch: width2+1},
            {wch: HEADERS[2].length}
        ]
    }
}

export default async function exportToExcel(firstBox:string = "1"):Promise<Buffer>{
    const buffer: Array<{name:string, data:Array<Array<any>>, options:any}> = [];
    const homeList = await initHome();
    const options = createOptions(homeList);
    
    let boxNumber:number = isNaN(Number(firstBox))? 1: Number(firstBox);
    let column:number = 1;
    let row:number = 1;
    const getPos = () => `${boxNumber}-${row}-${column}`;

    const reset = () => {
        boxNumber++;
        column = 1;
        row = 1;
    }

    const inc = () => {
        if(column++ >= MAX_COLUMNS){
            column = 1;
            if(row++ > MAX_ROWS){
                console.warn(`Box overflow at: ${getPos()}`);
            }
        }
    }

    for(const name in homeList) {
        const data:Array<Array<any>> = [Array.from(HEADERS)];
        const region = homeList[name];
        
        for(const index in region){
            const box = region[index];
            const boxName = name.concat(" ", index);

            if(box.length === 0){
                data.push(["", boxName, boxNumber]);
            } else {
                for(const value of box){
                    data.push([value, boxName, getPos()]);
                    inc();
                }
            }
            reset();
        }
        
        buffer.push({name, data, options});
    }

    return xlsx.build(buffer);
}