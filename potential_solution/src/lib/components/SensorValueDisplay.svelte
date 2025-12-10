<script lang="ts">
	import type { SensorConfig } from '$lib/classes/SensorConfig';

	let {
		sensorConfig,
		value
	}: {
		sensorConfig: SensorConfig;
		value: number;
	} = $props();

	let formattedValue = $derived(value ? value.toFixed(sensorConfig.precision) : '--');
	let critical = $derived(
		(sensorConfig.hiHi !== undefined && value >= sensorConfig.hiHi) ||
			(sensorConfig.loLo !== undefined && value <= sensorConfig.loLo)
			? 'critical'
			: ''
	);
	let warning = $derived(
		!critical &&
			((sensorConfig.hi !== undefined && value >= sensorConfig.hi) ||
				(sensorConfig.lo !== undefined && value <= sensorConfig.lo))
			? 'warning'
			: ''
	);
</script>

<div class={['sensor-value', { critical, warning }]}>
	<div class="label">{sensorConfig.label}:</div>
	<div class="value">
		<strong>{formattedValue}</strong>
		<span class="unit">{sensorConfig.unit}</span>
	</div>
</div>

<style>
	.sensor-value {
		padding: var(--space-sm);
		background: var(--color-surface-elevated);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.sensor-value:hover {
		border-color: var(--color-border-hover);
	}

	.label {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-xs);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 500;
	}

	.value {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-sm);
		min-height: 1.75rem;
	}

	.value strong {
		font-size: var(--text-lg);
		color: var(--color-success);
		font-variant-numeric: tabular-nums;
		min-width: 4ch;
		text-align: right;
		flex: 1;
		font-weight: 600;
	}

	.unit {
		font-size: var(--text-base);
		color: var(--color-text-tertiary);
		font-weight: 500;
		min-width: 3ch;
		text-align: left;
		flex-shrink: 0;
	}

	.warning {
		border-color: var(--color-warning);
		background: var(--color-warning-bg);
	}

	.warning .value strong {
		color: var(--color-warning);
	}

	.warning .unit {
		color: var(--color-warning-light);
	}

	.critical {
		border-color: var(--color-critical);
		background: var(--color-critical-bg);
		animation: pulse-border 2s infinite;
	}

	.critical .value strong {
		color: var(--color-critical);
	}

	.critical .unit {
		color: var(--color-critical-light);
	}

	@keyframes pulse-border {
		0%,
		100% {
			border-color: var(--color-critical);
		}
		50% {
			border-color: var(--color-critical-pulse);
		}
	}
</style>
