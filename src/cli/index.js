export default class Cli {
    static parse(argv = []) {
        const paramsArray = {};
    
        for(let i = 0; i < argv.length; i++) {
            if(!argv[i].startsWith('--')) {
                paramsArray[i] = argv[i];
                continue;
            }

            let [arg_name, arg_value] = argv[i].split('=', 2);
            if(!arg_value) {
                if(argv[i + 1] && !argv[i + 1].startsWith('--')) {
                    arg_value = argv[i + 1];
                    i++;
                } else {
                    arg_value = arg_name;
                }
            }
            
            paramsArray[arg_name.slice(2)] = arg_value;
        }

        return paramsArray;
    } 
}
