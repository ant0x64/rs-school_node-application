import { EOL, cpus, homedir, userInfo } from 'node:os';
import process from 'node:process';

export default class OS {
    /**
     * @returns {string}
     */
    static getEOL() {
        return EOL;
    } 

    /**
     * @returns { [{model: <string>, clock: <string>}] }
     */
    static getCpus() {
        return cpus().reduce((result, cpu) => {
            result.push({
                model: cpu.model,
                clock: (cpu.speed / 1000).toFixed(2)
            });
            return result;
        }, []);
    }

    /**
     * @returns {string}
     */
    static getHomedir() {
        return homedir();
    }

    /**
     * @returns {string}
     */
    static getUsername() {
        return userInfo().username;
    }

    /**
     * @returns {string}
     */
    static getArchitecture() {
        return process.arch;
    }
}
