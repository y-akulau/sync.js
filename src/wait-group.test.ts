import { beforeEach, describe, expect, it, vi } from "vitest";
import { spyOnPromise } from "./test.fixture";
import { WaitGroup } from "./wait-group";

describe(WaitGroup.name, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it("should not wait for no tasks", async () => {
        const wg = new WaitGroup();

        const waitSpy = spyOnPromise(wg.wait());
        await vi.runAllTimersAsync();
        expect(waitSpy.isPending).toBe(false);
        await expect(waitSpy.promise).resolves.toBeUndefined();
    });

    it("should wait for a task", async () => {
        const wg = new WaitGroup();

        wg.add();
        const waitSpy = spyOnPromise(wg.wait());
        await vi.runAllTimersAsync();
        expect(waitSpy.isPending).toBe(true);

        wg.done();
        await vi.runAllTimersAsync();
        expect(waitSpy.isPending).toBe(false);
        await expect(waitSpy.promise).resolves.toBeUndefined();
    });

    it("should wait for multiple tasks", async () => {
        const wg = new WaitGroup();

        const time = 1000;

        wg.add();
        setTimeout(() => {
            wg.done();
        }, time / 2);

        wg.add();
        setTimeout(() => {
            wg.done();
        }, time);

        const waitSpy = spyOnPromise(wg.wait());
        await vi.advanceTimersByTimeAsync(0);
        expect(waitSpy.isPending).toBe(true);

        await vi.advanceTimersByTimeAsync(time / 2);
        expect(waitSpy.isPending).toBe(true);

        await vi.advanceTimersByTimeAsync(time / 2);
        expect(waitSpy.isPending).toBe(false);
        await expect(waitSpy.promise).resolves.toBeUndefined();
    });
});
