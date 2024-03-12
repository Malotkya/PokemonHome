/** /ExportExcel
 * 
 * @author Alex Malotky
 */
import xlsx, {BuildOptions} from 'node-xlsx';
import initHome, {Home} from './Pokemon/Home';

/** Export Help Information
 * 
 */
export const help = {
    name: "export",
    args: "[firstBox:number = 1] [target:string = 'export.xlsx']",
    description: "Exports home information to excel spreadsheet."
}

//Constants Used by Export Function
const MAX_COLUMNS = 6;
const MAX_ROWS = 5;
const HEADERS = ["Name:", "Box Name", "Position"];

/** Create Excel Build Options
 * 
 * @param {Home} data 
 * @returns {BuildOptions}
 */
function createOptions(data:Home):BuildOptions {
    //Get the Widths of the first two columns
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

    //Export widths of each column
    return {
        '!cols': [
            {wch: width1+1},
            {wch: width2+1},
            {wch: HEADERS[2].length}
        ]
    }
}

/** Export to Excel
 * 
 * @param {number} firstBox 
 * @returns {Buffer}
 */
export default async function exportToExcel(firstBox:string = "1"):Promise<Buffer>{
    //Output buffer
    const buffer: Array<{name:string, data:Array<Array<any>>, options:any}> = [];

    //Constants used in loop
    const homeList = await initHome();
    const options = createOptions(homeList);
    
    //Position information
    let boxNumber:number = isNaN(Number(firstBox))? 1: Number(firstBox);
    let column:number = 1;
    let row:number = 1;

    /** Get Current Position
     * 
     * @returns {string}
     */
    const getPos = ():string => `${boxNumber}-${row}-${column}`;

    /** Reset Column & Row
     * 
     * Also increments box number;
     */
    const reset = () => {
        boxNumber++;
        column = 1;
        row = 1;
    }

    /** Increment Column & Row
     * 
     */
    const inc = () => {
        if(column++ >= MAX_COLUMNS){
            column = 1;
            if(row++ > MAX_ROWS){
                console.warn(`Box overflow at: ${getPos()}`);
            }
        }
    }

    //Loop over each region in home
    for(const name in homeList) {
        const data:Array<Array<any>> = [Array.from(HEADERS)];
        const region = homeList[name];
        
        //Loop over each box in region
        for(const index in region){
            const box = region[index];
            const boxName = name.concat(" ", index);

            if(box.length === 0){
                //Empty box
                data.push(["", boxName, boxNumber]);
            } else {
                //Box with info
                for(const value of box){
                    data.push([value, boxName, getPos()]);
                    inc();
                }
            }
            reset();
        }
        
        //Add data to buffer.
        buffer.push({name, data, options});
    }

    //Convert buffer to xlsx buffer
    return xlsx.build(buffer);
}