import { describe, expect, it } from "vitest";
import { greet } from ".";

describe(greet.name, () => {
    it(`should print "Hello, Seaman"`, () => {
        const buffer: string[] = [];
        const write = (text: string) => buffer.push(text);

        greet("Seaman", write);

        expect(buffer).toEqual(["Hello, Seaman!"]);
    });
});
