import { createReadStream, createWriteStream } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

import { createGzip, createGunzip } from 'node:zlib';
import { Stats } from 'node:fs'; // eslint-disable-line no-unused-vars

export default class Compressor {
    /**
     * @param {string} source 
     * @param {string} destination 
     */
    static async compress(source, destination) {
    
        await stat(destination).then(
            /**
                 * @param {Stats} stat 
                 */
            (stat) => {
                if(stat.isFile()) {
                    throw new Error('The destination file exists');
                } else if (stat.isDirectory()) {
                    throw new Error('The destination path can\'t be a directory');
                }
            }, () => {}
        );
    
        await stat(source).then(
            async (stat) => {
                /**
                    * @param {Stats} stat 
                    */
                if(stat.isDirectory()) {
                    throw new Error('The source path can\'t be a directory')
                }
                await pipeline(createReadStream(source), createGzip(), createWriteStream(destination));
            }, () => {
                throw new Error('The source file doesn\'t exist');
            }
        );
    }
    
    /**
         * @param {string} source 
         * @param {string} destination 
         */
    static async decompress(source, destination) {
    
        await stat(destination).then(
            /**
                 * @param {Stats} stat 
                 */
            (stat) => {
                if(stat.isFile()) {
                    throw new Error('The destination file exists');
                } else if (stat.isDirectory()) {
                    throw new Error('The destination path can\'t be a directory');
                }
            }, () => {}
        );
    
        await stat(source).then(
            async (stat) => {
                /**
                    * @param {Stats} stat 
                    */
                if(stat.isDirectory()) {
                    throw new Error('The source path can\'t be a directory')
                }
                await pipeline(createReadStream(source), createGunzip(), createWriteStream(destination)).catch((err) => {
                    if(err) {
                        unlink(destination);
                        throw err;
                    }
                });
            }, () => {
                throw new Error('The source file doesn\'t exist');
            }
        );
    }
}
