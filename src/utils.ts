import { terminal } from "terminal-kit";

export interface ProgressTask {
    name: string;
    task: () => Promise<void>;
}

class ProgressBar {
    public bar: any;
    private tasks: ProgressTask[];
    private countDown: number;
    private onCompleteCallback?: () => void;

    constructor(title: string, tasks: ProgressTask[]) {
        this.tasks = [...tasks];
        this.countDown = this.tasks.length;

        terminal.clear();
        
        this.bar = terminal.progressBar({
            width: 90,
            title: title,
            eta: true,
            percent: true,
            items: this.tasks.length
        });
    }

    public async start(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        for (const taskObj of this.tasks) {
            this.bar.startItem(taskObj.name);
            
            try {
                await taskObj.task();
                this.bar.itemDone(taskObj.name);
                this.countDown--;
            } catch (error) {
                this.bar.itemDone(taskObj.name);
                this.countDown--;
                console.error(`Error en tarea ${taskObj.name}:`, error);
            }
        }

        terminal('\n');
        if (this.onCompleteCallback) this.onCompleteCallback();
    }

    public onComplete(callback: () => void): void {
        this.onCompleteCallback = callback;
    }
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export { ProgressBar, wait };