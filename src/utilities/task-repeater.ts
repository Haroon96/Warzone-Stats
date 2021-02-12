export default class TaskRepeater {

    constructor(taskFn, args, delay, retries) {
        this.taskFn = taskFn;
        this.args = args;
        this.delay = delay;
        this.retries = retries;
    }

    async run() {
        for (let i = 0; i < this.retries; ++i) {
            try {
                return await this.taskFn(...this.args);
            } catch (e) {
                this.error = e;
                await this.timeout();
            }
        }
        throw this.error;
    }

    timeout() {
        return new Promise(resolve => {
            setTimeout(resolve, this.delay);
        });
    }

    taskFn: Function;
    args: Array<string>;
    delay: number;
    retries: number;
    error: any;
}