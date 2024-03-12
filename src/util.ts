/** /util
 * 
 * @author Alex Malotky
 */
import https from 'https'

/** Cache and Queue used by fetch call.
 * 
 * Queue is nessisary because Serebii will close multiple connections opened at the same time.
 * 
 */
const cache:Map<string, string> = new Map();
const queue:Array<string> = [];

/** Feth data
 * 
 * Uses queue and cache.
 * 
 * @param {string} url 
 * @returns {string}
 */
export async function fetch(url:string):Promise<string>{
    //Check if cached
    const check = cache.get(url);
    if(check)
        return check;

    //Check if url is already queued.
    if(!queue.includes(url))
        queue.push(url);

    //Wait for turn.
    while(queue[0] !== url && queue.length > 0)
        await sleep();
        

    //Attempt download unless same error occures twice.
    let error:any = undefined;
    while(true){
        try {
            const buffer = await wrapper(url);

            //Remvoe from queue when done.
            if(queue[0] === url)
                queue.shift();

            //Cache results
            cache.set(url, buffer);

            return buffer;
        } catch (e:any){
            const next = e.message || e;
            if(next === error)
                throw e;
            error = next;
        }
    }
}

/** Sleep function used when waiting for result.
 * 
 * @param {number} n 
 */
export function sleep(n:number = 10) {
    return new Promise((res)=>{
        setTimeout(res, n);
    });
}

/** Download Wrapper
 * 
 * Wrapper around https buffer stream.
 * 
 * @param {string} url 
 * @returns {string}
 */
function wrapper(url:string):Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, response=>{
            let buffer:string = "";

            response.on("data", (chunk)=>{
                buffer += chunk.toString();
            });
        
            response.on("error", (err)=>{
                reject(err);
            });
        
            response.on("close", ()=>{
                resolve(buffer);
            });
        });
    });
}