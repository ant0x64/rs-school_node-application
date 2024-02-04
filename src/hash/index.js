import { createHash } from 'node:crypto';
import { createReadStream } from 'fs';
import { pipeline } from 'node:stream/promises';

export default class Hash {
    /**
     * @param {string} path 
     * @returns {Promise<string>}
     */
    static async create(path) {
        const hash = createHash('SHA256');
            
        await pipeline(createReadStream(path), hash);
    
        return hash.digest('hex');
    }
}
