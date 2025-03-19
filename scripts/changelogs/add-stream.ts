import { PassThrough, Writable } from 'stream';

interface StreamOptions {
    encoding?: BufferEncoding;
    objectMode?: boolean;
    highWaterMark?: number;
}

type StreamFactory = () => NodeJS.ReadableStream;

class Appendee extends PassThrough {
    constructor(
        private factory: StreamFactory,
        private opts: StreamOptions,
    ) {
        super(opts);
    }

    _flush(end: (error?: Error | null) => void) {
        const stream = this.factory();
        stream.pipe(new Appender(this, this.opts)).on('finish', end);
        stream.resume();
    }
}

class Appender extends Writable {
    constructor(
        private target: PassThrough,
        opts: StreamOptions,
    ) {
        super(opts);
    }

    _write(chunk: Buffer | string, _enc: BufferEncoding, cb: (error?: Error | null) => void) {
        this.target.push(chunk);
        cb();
    }
}

/**
 * Append the contents of one stream onto another.
 * Based on https://github.com/wilsonjackson/add-stream
 */
export function addStream(stream: NodeJS.ReadableStream | StreamFactory, opts?: StreamOptions) {
    opts = opts || {};
    let factory: StreamFactory;
    if (typeof stream === 'function') {
        factory = stream as StreamFactory;
    } else {
        stream.pause();
        factory = () => stream as NodeJS.ReadableStream;
    }
    return new Appendee(factory, opts);
}
