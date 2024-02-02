export default class Cli {

    /**
     * @param {[]} argv 
     * @returns {{key: <string>, value: <string>|null}}
     */
    static parse(argv = []) {
        return argv.filter(el => !el.startsWith('--'));
    }

    /**
     * 
     * @param {[string]} argv 
     * @returns {{<string>:<string>|<boolean>}}
     */
    static parseParams(argv = []) {
        const result = {};
    
        for(let i = 0; i < argv.length; i++) {
            if(!argv[i].startsWith('--')) {
                continue;
            }

            let [arg_name, arg_value] = argv[i].split('=', 2);
            if(!arg_value) {
                if(argv[i + 1] && !argv[i + 1].startsWith('--')) {
                    arg_value = argv[i + 1];
                    i++;
                } else {
                    arg_value = true;
                }
            }
            
            result[arg_name.substring(2)] = arg_value;
        }

        return result;
    }
}
