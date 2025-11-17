import { spawn } from "child_process";
import path from "path";
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

function executeBatch(batPath: any) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(process.cwd(), batPath);
        console.log(`Ejecutando: ${fullPath}`);

        const batProcess = spawn("cmd.exe", ["/c", fullPath], {
            windowsHide: false,
            stdio: "inherit"
        });

        batProcess.on('close', (code) => {
            if (code === 0) resolve(0);
            else reject(new Error(`El proceso terminó con código ${code}`));
        });

        batProcess.on('error', (error) => reject(error));

        setTimeout(() => {
            batProcess.kill();
            reject(new Error('Timeout ejecutando el batch'));
        }, 30000);
  });
}


export { ProgressBar, wait, executeBatch };