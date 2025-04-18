export interface LaravelException {
    message: string;
    exception: string;
    file: string;
    line: number;
    trace: LaravelTrace[];
}

interface LaravelTrace {
    file: string;
    line: number;
    function: string;
    class?: string;
    type?: string;
}