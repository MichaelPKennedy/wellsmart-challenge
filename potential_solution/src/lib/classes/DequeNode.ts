export class DequeNode {
    constructor(
        public value: number,
        public timestamp: number,
        public next: DequeNode | null = null,
        public prev: DequeNode | null = null
    ) { }
}