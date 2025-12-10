<script>
	import SensorChartCanvas from '$lib/components/SensorChartCanvas.svelte';
	import SensorValueDisplay from '$lib/components/SensorValueDisplay.svelte';
	import { getContext } from 'svelte';

	const {
		flowConfig,
		powerConfig,
		pressurePSIConfig,
		pressureBarConfig,
		sensorData,
		timeStampEpoch
	} = getContext('globalState');
</script>

<main>
	<h1>Real-Time Sensor Data</h1>

	{#if sensorData()}
		<div class="data">
			<div class="values">
				<SensorValueDisplay sensorConfig={flowConfig()} value={sensorData().flow_gpm} />

				<SensorValueDisplay sensorConfig={powerConfig()} value={sensorData().power_kW} />

				<SensorValueDisplay sensorConfig={pressurePSIConfig()} value={sensorData().pressure_psi} />

				<SensorValueDisplay sensorConfig={pressureBarConfig()} value={sensorData().pressure_bar} />

				<div class="timestamp">
					Last Update: {sensorData().timestamp.toLocaleTimeString()}
				</div>
			</div>
			<div class="charts">
				<SensorChartCanvas
					sensorConfig={flowConfig()}
					value={sensorData().flow_gpm}
					time={timeStampEpoch()}
					showGrid={true}
				/>

				<SensorChartCanvas
					sensorConfig={powerConfig()}
					value={sensorData().power_kW}
					time={timeStampEpoch()}
					showGrid={true}
				/>

				<SensorChartCanvas
					sensorConfig={pressurePSIConfig()}
					value={sensorData().pressure_psi}
					time={timeStampEpoch()}
					showGrid={true}
				/>

				<SensorChartCanvas
					sensorConfig={pressureBarConfig()}
					value={sensorData().pressure_bar}
					time={timeStampEpoch()}
					showGrid={true}
				/>
			</div>
		</div>
	{:else}
		<div class="waiting">Waiting for data...</div>
	{/if}
</main>

<style>
	main {
		padding: var(--space-md);
		max-width: min(95vw, 1400px);
		margin: 0 auto;
		min-height: 100vh;
	}

	h1 {
		color: var(--color-text-primary);
		margin-bottom: var(--space-md);
		font-size: var(--text-xl);
		font-weight: 600;
	}

	.data {
		background: var(--color-surface);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	@media (min-width: 1025px) {
		.data {
			flex-direction: row;
		}
	}

	.values {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin: var(--space-sm) 0;
	}

	@media (min-width: 1025px) {
		.values {
			flex: 0 0 clamp(280px, 25vw, 350px);
		}
	}

	.timestamp {
		font-size: var(--text-sm);
		color: var(--color-text-tertiary);
		margin-top: var(--space-sm);
		font-variant-numeric: tabular-nums;
	}

	.charts {
		flex: 1;
		padding: var(--space-sm);
		min-height: clamp(250px, 40vh, 400px);
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-md);
		transition: border-color 0.2s ease;
	}

	@media (min-width: 1025px) {
		.charts {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
		}
	}

	.charts:hover {
		border-color: var(--color-border-hover);
	}

	.waiting {
		text-align: center;
		padding: var(--space-xl);
		color: var(--color-text-disabled);
		font-style: italic;
		font-size: var(--text-base);
	}
</style>
