async function withFinalizer<T>(
    promise: Promise<T>,
    block: () => void,
): Promise<T> {
    try {
        return await promise;
    } finally {
        block();
    }
}

export function spyOnPromise<T>(promise: Promise<T>) {
    let isPending = true;

    return {
        get isPending() {
            return isPending;
        },

        promise: withFinalizer(promise, () => {
            isPending = false;
        }),
    };
}
