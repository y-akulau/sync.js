import { beforeEach, describe, expect, it } from "vitest";
import { RwLock } from "./rw-lock";

const flushMicrotasks = async () =>
    await new Promise((resolve) => setTimeout(resolve, 0));

describe(RwLock.name, () => {
    beforeEach(() => {});

    it("should allow multiple readers", async () => {
        const lock = new RwLock();
        const order: string[] = [];

        await lock.read();
        order.push("Read 1");

        await lock.read();
        order.push("Read 2");

        expect(order).toEqual(["Read 1", "Read 2"]);
    });

    it("should not allow multiple writers", async () => {
        const lock = new RwLock();
        const order: string[] = [];

        const guard1 = await lock.write();
        order.push("Write 1");

        const writing = lock.write().then((guard2) => {
            order.push("Write 2");
            guard2.release();
        });

        flushMicrotasks();
        expect(order).toEqual(["Write 1"]);

        guard1.release();
        await writing;

        expect(order).toEqual(["Write 1", "Write 2"]);
    });

    it("should block readers while a writer has the lock", async () => {
        const lock = new RwLock();
        const order: string[] = [];

        const writeGuard = await lock.write();
        order.push("Write");

        const reading = lock.read().then((readGuard) => {
            order.push("Read");
            readGuard.release();
        });

        flushMicrotasks();

        expect(order).toEqual(["Write"]);

        writeGuard.release();

        await reading;
        expect(order).toEqual(["Write", "Read"]);
    });

    it("should block writers until all readers release the lock", async () => {
        const lock = new RwLock();
        const order: string[] = [];

        const guard1 = await lock.read();
        const guard2 = await lock.read();
        order.push("Read");

        const writing = lock.write().then((guard) => {
            order.push("Write");
            guard.release();
        });

        flushMicrotasks();
        expect(order).toEqual(["Read"]);

        guard1.release();
        flushMicrotasks();
        expect(order).toEqual(["Read"]);

        guard2.release();
        await writing;
        expect(order).toEqual(["Read", "Write"]);
    });
});
