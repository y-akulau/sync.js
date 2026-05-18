import { LockGuard } from "./lock-guard";
import { Mutex } from "./mutex";
import { WaitGroup } from "./wait-group";

export class RwLock {
    #lock = new Mutex();
    #reads = new WaitGroup();
    #write = new WaitGroup();

    async read(): Promise<LockGuard> {
        {
            using _ = await this.#lock.acquire();
            await this.#write.wait();
            this.#reads.add();
        }

        return new LockGuard(() => {
            this.#reads.done();
        });
    }

    async write(): Promise<LockGuard> {
        {
            using _ = await this.#lock.acquire();
            await this.#write.wait();
            await this.#reads.wait();
            this.#write.add();
        }

        return new LockGuard(() => {
            this.#write.done();
        });
    }
}
