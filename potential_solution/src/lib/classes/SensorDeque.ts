import { DequeNode } from "$lib/classes/DequeNode";

export class SensorDeque {
    private first: DequeNode | null = null;
    private last: DequeNode | null = null;
    private count: number = 0;
    private average: number = 0;
    private maxLength: number = 0;
    private span: number = 0;

    /**
     * Add new data point to buffer - O(1) doubly-linked list operation
     * Automatically maintains maxSize by removing oldest items
     * Updates running average in-place for O(1) statistical tracking
     */
    push(newValue: number, newTimestamp: number) {
        const newNode = new DequeNode(newValue, newTimestamp, null, this.last);

        if (this.last) {
            this.last.next = newNode;
        } else {
            this.first = newNode;
        }
        this.last = newNode;
        this.count++;  // always greater than zero here

        this.average = this.average + (newValue - this.average) / this.count;
        this.span = this.last.timestamp - (this.first ? this.first.timestamp : 0);

        if (this.count > this.maxLength) {
            this.popFirst();
        }
    }

    /**
     * FIFO first item from front, updating item count and average - O(1)
     */
    private popFirst() {
        if (!this.first) return;

        const removedValue = this.first.value;

        this.first = this.first.next;
        if (this.first) {
            this.first.prev = null;
        } else {
            this.last = null;
        }
        this.count--;

        if (this.count > 0) {
            this.average = this.average + (this.average - removedValue) / this.count;
        } else {
            this.average = 0;
        }
    }

    /**
     * Update maximum buffer length, effectively changing chart zoom level
     * Removes oldest items if new maxSize is smaller
     * Zoom out is O(1),  Zoom in is O(maxSize - newMaxSize)
     */
    updateMaxLength(newMaxLength: number) {
        if (newMaxLength <= 1) {
            throw new Error(`newMaxLength must be a positive number, got: ${newMaxLength}`);
        }

        this.maxLength = newMaxLength;

        while (this.count > this.maxLength) {
            this.popFirst();
        }

        this.span = (this.last ? this.last.timestamp : 0) - (this.first ? this.first.timestamp : 0);
    }

    /**
     * Clear deque - O(1)
     */
    clear() {
        this.first = null;
        this.last = null;
        this.count = 0;
        this.average = 0; // Reset average
    }

    /**
     * Get current number of items - O(1)
     */
    get length() {
        return this.count;
    }

    /**
     * Get the maximum buffer length - O(1)
     */
    get maximumLength() {
        return this.maxLength;
    }

    /**
     * Get the last (most recent) node - O(1)
     */
    get lastNode() {
        return this.last;
    }

    /**
     * Get the first (oldest) node - O(1)
     */
    get firstNode() {
        return this.first;
    }

    /**
     * Check if buffer has data - O(1)
     */
    get isEmpty() {
        return this.count === 0;
    }

    /**
     * Get current in-place average - O(1)
     */
    get averageValue() {
        return this.average;
    }

    /**  
     * Get current time span in seconds - O(1)
     */
    get spanSeconds() {
        return this.span / 1000;
    }
}