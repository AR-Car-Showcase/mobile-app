const createWorkerPolyfill = () => {
    return class {
        constructor() { }
        postMessage() { }
        terminate() { }
        addEventListener() { }
        removeEventListener() { }
        onmessage = () => { };
        onerror = () => { };
    };
};

if (typeof global.Worker === 'undefined') {
    // @ts-ignore
    global.Worker = createWorkerPolyfill();
}
if (typeof self !== 'undefined' && typeof (self as any).Worker === 'undefined') {
    (self as any).Worker = global.Worker;
}
if (typeof (global as any).window !== 'undefined' && typeof (global as any).window.Worker === 'undefined') {
    (global as any).window.Worker = global.Worker;
} else if (typeof (global as any).window === 'undefined') {
    // @ts-ignore
    global.window = global;
    // @ts-ignore
    global.window.Worker = global.Worker;
}
