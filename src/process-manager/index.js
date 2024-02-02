import { EOL } from "node:os";

export default class ProcessManager {

    username = null;
    
    COLORS = {
        text: {
            default: 34,
            error: 91,
            success: 92,
            warning: 43,
            result: 45
        }
    }

    /**
     * @param {string} username 
     */
    constructor(username) {
        this.username = typeof username == 'string' ? username : 'Noname';
    }

    message = (message, type) => {
        process.stdout.write(`\x1b[${this.COLORS.text[type]??this.COLORS.text.default}m${message}\x1b[0m` + EOL);
    }
    welcome = () => {
        this.message(`Welcome to the File Manager, ${this.username}!`);
    }
    shutdown = () => {
        this.message(`Thank you for using File Manager, ${this.username}, goodbye!`)
        process.stdin.removeAllListeners();
        process.exit();
    }
    success = () => {
        this.message('Operation completed', 'success')
    }
    error = () => {
        this.message('Operation failed', 'error')
    }
    invalidInput = () => {
        this.message('Invalid input', 'error');
    }
    showCurrentPath = (path) => {
        this.message(`${EOL}You are currently in \x1b[1m${path}`);
    }
}
