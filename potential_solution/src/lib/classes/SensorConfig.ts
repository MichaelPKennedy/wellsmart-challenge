export class SensorConfig {
    label: string;
    unit: string;
    precision: number;
    loLo: number | undefined;
    lo: number | undefined;
    hi: number | undefined;
    hiHi: number | undefined;

    constructor(options: {
        label: string;
        unit: string;
        precision: number;
        loLo?: number;
        lo?: number;
        hi?: number;
        hiHi?: number;
    }) {
        this.label = options.label;
        this.unit = options.unit;

        // Validate precision is a positive integer
        const precision = options.precision;
        if (!Number.isInteger(precision) || precision < 0) {
            throw new Error(`Precision must be a non-negative integer, got: ${precision}`);
        }
        this.precision = precision;

        this.loLo = options.loLo;
        this.lo = options.lo;
        this.hi = options.hi;
        this.hiHi = options.hiHi;
    }
}