/**
 * A `WaitGroup` is a counting semaphore typically used to wait for a group of tasks to finish.
 *
 * Typically, a main task will start other tasks
 * and then wait for all tasks to complete by calling `WaitGroup.wait`.
 *
 * @example
 * ```ts
 * declare function task1(): Promise<void>;
 * declare function task2(): void;
 * declare const eventEmitter: SomeEventEmitter;
 *
 * // Using `add` + `done`:
 * const wg = new WaitGroup();
 *
 * wg.add();
 * void task1().finally(() => {
 *     wg.done();
 * });
 *
 * wg.add();
 * setTimeout(() => {
 *     try {
 *         task2();
 *     } finally {
 *         wg.done();
 *     }
 * }, 1000);
 *
 * wg.add();
 * eventEmitter.on("done", () => {
 *     wg.done();
 * });
 *
 * await wg.wait();
 * ```
 */
export class WaitGroup {
    #count!: number;
    #waiting!: Promise<void>;
    #release!: () => void;

    constructor() {
        this.#reset();
    }

    /**
     * Adds delta, which may be negative, to the counter.
     * If the delta is not specified, 1 is used.
     *
     * If the counter becomes zero, all callers blocked on `WaitGroup.wait` are released.
     * If the counter goes negative, throws an error.
     * If the counter goes greater than {@link Number.MAX_SAFE_INTEGER}, throws an error.
     *
     * @param delta an integer number (default: 1).
     */
    add(delta = 1): void {
        if (!Number.isInteger(delta)) {
            throw new TypeError("Delta must be an integer number");
        }

        this.#count += delta;
        if (this.#count < 0) {
            throw new RangeError("Count must be non-negative");
        }

        if (this.#count > Number.MAX_SAFE_INTEGER) {
            throw new RangeError(
                `Count must be less than ${Number.MAX_SAFE_INTEGER}`,
            );
        }

        if (this.#count === 0) {
            this.#release();
            this.#reset();
        }
    }

    /**
     * Decrements the counter by one. It is equivalent to `WaitGroup.add(-1)`.
     */
    done(): void {
        this.add(-1);
    }

    /**
     * Blocks until the counter is zero.
     */
    async wait(): Promise<void> {
        if (this.#count === 0) return;
        return this.#waiting;
    }

    #reset(): void {
        this.#count = 0;
        this.#waiting = new Promise((resolve) => {
            this.#release = resolve;
        });
    }
}
