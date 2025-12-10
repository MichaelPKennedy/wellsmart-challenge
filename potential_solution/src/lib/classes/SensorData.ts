export class SensorData {
    flow_gpm: number;
    power_kW: number;
    pressure_psi: number;
    pressure_bar: number;
    sensor_alarm: boolean;
    timestamp: Date;
    message_type: string;

    constructor() {
        this.flow_gpm = 0;
        this.power_kW = 0;
        this.pressure_psi = 0;
        this.pressure_bar = 0;
        this.sensor_alarm = false;
        this.timestamp = new Date();
        this.message_type = '';
    }

    // Static method to create from WebSocket data
    static fromWebSocket(data: any): SensorData {
        const sensor = new SensorData();
        sensor.flow_gpm = data.flow_gpm ?? 0;
        sensor.power_kW = data.power_kW ?? 0;
        sensor.pressure_psi = data.pressure_psi ?? 0;
        sensor.pressure_bar = data.pressure_bar ?? 0;
        sensor.sensor_alarm = data.sensor_alarm ?? false;
        sensor.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
        sensor.message_type = data.message_type ?? '';
        return sensor;
    }

    get alarmStatus(): string {
        return this.sensor_alarm ? 'ALARM' : 'Normal';
    }
}