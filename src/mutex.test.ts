import { beforeEach, describe, expect, it, vi } from "vitest";
import { Mutex } from "./mutex";
import { spyOnPromise } from "./test.fixture";

const delay = (ms?: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

describe(Mutex.name, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it("should not wait if is not acquired", async () => {
        const mutex = new Mutex();

        const acquireSpy = spyOnPromise(mutex.acquire());
        await vi.runAllTimersAsync();
        expect(acquireSpy.isPending).toBe(false);
    });

    it("should wait until released", async () => {
        const mutex = new Mutex();

        const messages: string[] = [];

        (async () => {
            await delay(1);
            messages.push("Start 1");

            using _ = await mutex.acquire();
            messages.push("Acquire 1");

            await delay(10);
            messages.push("End 1");
        })();

        (async () => {
            messages.push("Start 2");

            using _ = await mutex.acquire();
            messages.push("Acquire 2");

            await delay(20);
            messages.push("End 2");
        })();

        await vi.advanceTimersByTimeAsync(1);
        expect(messages).toEqual(["Start 2", "Acquire 2", "Start 1"]);
        messages.length = 0;

        await vi.advanceTimersByTimeAsync(10 + 20);
        expect(messages).toEqual(["End 2", "Acquire 1", "End 1"]);
    });
});
