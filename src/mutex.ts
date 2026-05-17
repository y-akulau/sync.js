import { LockGuard } from "./lock-guard";

/**
 * A mutual exclusion primitive useful for protecting shared data.
 *
 * @example
 * ```ts
 * {
 *     using _ = await mutex.acquire(); // Lock is acquired
 *     // Critical section to the end of the scope.
 * } // Lock is released
 *
 * ```
 */
export class Mutex {
    #queue = Promise.resolve();

    /**
     * Acquires the lock.
     * The promise will be resolved as soon as it can able to do that.
     * It will wait for other tasks that tried to acquire the lock earlier in the queue to release it.
     *
     * @returns a guard that will release the lock when disposed.
     */
    async acquire(): Promise<LockGuard> {
        let release!: () => void;
        const lock = new Promise<void>((resolve) => {
            release = resolve;
        });

        const previous = this.#queue;
        this.#queue = this.#queue.then(() => lock);

        await previous;
        return new LockGuard(release);
    }
}
