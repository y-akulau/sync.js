export function greet(
    name: string,
    write: (text: string) => void = console.log,
): void {
    write(`Hello, ${name}!`);
}
