/**
 * A `LockGuard` is a disposable object that holds an acquired lock and releases it when disposed.
 *
 * Releases the resource only once.
 *
 * @example
 * ```ts
 * // Acquire lock then release it:
 * const guard = await mutex.acquire();
 * try {
 *     // Critical section.
 * } finally {
 *     guard.release();
 * }
 *
 * // Or with `using`:
 * using _ = await mutex.acquire();
 * // Critical section to the end of the scope.
 * ```
 */
export class LockGuard {
    #release: (() => void) | null;

    /**
     * @param release a function to release dedicated lock.
     */
    constructor(release: () => void) {
        this.#release = release;
    }

    /**
     * Releases the lock. It is equivalent to `LockGuard.release()`.
     */
    [Symbol.dispose]() {
        this.release();
    }

    /**
     * Releases the lock.
     */
    release() {
        this.#release?.();
        this.#release = null;
    }
}
