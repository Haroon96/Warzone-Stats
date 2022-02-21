export default class TaskRepeater<Result> {

    constructor(taskFn: (...args: any) => Result, args: Array<any>, delay: number, retries: number, onError: Function | null = null) {
        this.taskFn = taskFn
        this.args = args
        this.delay = delay
        this.retries = retries
        this.onError = onError
    }

    async run(): Promise<Result> {
        let error = null
        for (let i = 1; i <= this.retries; ++i) {
            try {
                // call repeater function
                return await this.taskFn(...this.args)
            } catch (e) {
                // onError callback
                if (this.onError) {
                    this.onError(e, i, this.retries)
                }
                // set error
                error = e
                // wait for timeout
                await this.timeout()
            }
        }
        throw error
    }

    timeout() {
        return new Promise(resolve => {
            // increase delay time for each error
            this.delay *= 2
            setTimeout(resolve, this.delay)
        })
    }

    taskFn: (...args: any) => Result
    args: Array<any>
    delay: number
    retries: number
    onError: Function | null
}