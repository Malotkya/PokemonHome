import fs from 'fs';
import path from 'path';
import filterList from './FilterList';

const testDirectory = path.join(process.cwd(), "test");

if(!fs.existsSync(testDirectory))
    fs.mkdirSync(testDirectory);

interface Regions {
    [name:string]:string
}

const regions:Regions = {
    paldea: "https://www.serebii.net/scarletviolet/paldeapokedex.shtml",
    kitakami: "https://www.serebii.net/scarletviolet/kitakamipokedex.shtml",
    blueberry: "https://www.serebii.net/scarletviolet/blueberrypokedex.shtml"
}



for(let name in regions){
    const target = path.join(testDirectory, name+".xlsx")
    filterList(regions[name])
        .then(buffer=>fs.writeFileSync(target, buffer))
        .catch(console.error);
}

