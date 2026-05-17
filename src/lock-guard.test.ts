import { describe, expect, it, vi } from "vitest";
import { LockGuard } from "./lock-guard";

describe(LockGuard.name, () => {
    it("should release a lock", () => {
        const releaseSpy = vi.fn();
        const guard = new LockGuard(releaseSpy);

        expect(releaseSpy).not.toHaveBeenCalled();

        guard.release();

        expect(releaseSpy).toHaveBeenCalledOnce();
    });

    it("should release a lock only once", () => {
        const releaseSpy = vi.fn();
        const guard = new LockGuard(releaseSpy);

        guard.release();
        guard.release();

        expect(releaseSpy).toHaveBeenCalledOnce();
    });

    it("should release a lock on dispose", () => {
        const releaseSpy = vi.fn();
        {
            using _ = new LockGuard(releaseSpy);

            expect(releaseSpy).not.toHaveBeenCalled();
        }

        expect(releaseSpy).toHaveBeenCalledOnce();
    });
});
