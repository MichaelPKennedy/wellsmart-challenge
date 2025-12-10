<script lang="ts">
	import type { DequeNode } from '$lib/classes/DequeNode';
	import type { SensorConfig } from '$lib/classes/SensorConfig';
	import { SensorDeque } from '$lib/classes/SensorDeque';
	import { getContext } from 'svelte';

	const globalState = getContext('globalState') as any;
	const themeProperties = globalState.themeProperties;

	// Component props
	let {
		sensorConfig,
		value,
		time,
		showGrid = true
	}: {
		sensorConfig: SensorConfig;
		value: number;
		time: number;
		showGrid?: boolean;
	} = $props();

	// Data object
	let dataBuffer: SensorDeque = new SensorDeque();

	// Canvas dimensions - will be set reactively to match parent
	let width = 400;
	let height = 200;

	// Canvas and rendering
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;

	let valuePadding = $state(1.0);
	let bufferLength = $state(100);

	let dv: number = 0;
	let dt: number = 0;

	const gridColor = $derived(themeProperties().colorTextSecondary || '#666666');
	const primaryColor = $derived(themeProperties().colorPrimary || '#3b82f6');
	const defaultColor = $derived(themeProperties().colorSuccess || '#10b981');
	const warningColor = $derived(themeProperties().colorWarning || '#f59e0b');
	const criticalColor = $derived(themeProperties().colorCritical || '#ef4444');

	// Reactive push to data buffer and rerender
	$effect(() => {
		dataBuffer.push(value, time);
		draw();
	});

	// Reactive horizontal span when dataBuffer changes
	$effect(() => {
		dataBuffer.updateMaxLength(bufferLength);
	});

	// Reactive canvas resizing to fit parent container
	$effect(() => {
		if (!canvas || !canvas.parentElement) return;

		const parent = canvas.parentElement;
		const parentRect = parent.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 1;

		const aspectRatio = 2;
		let newWidth = parentRect.width;
		let newHeight = newWidth / aspectRatio;

		// If height would be too tall for parent, constrain by height instead
		if (newHeight > parentRect.height) {
			newHeight = parentRect.height;
			newWidth = newHeight * aspectRatio;
		}

		width = newWidth;
		height = newHeight;

		canvas.width = width * dpr;
		canvas.height = height * dpr;

		ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.scale(dpr, dpr);
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
		}

		draw();
	});

	// Draw the chart - direct linked list iteration
	function draw() {
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		// Draw grid if showGrid is enabled
		if (showGrid) {
			ctx.strokeStyle = gridColor;
			ctx.lineWidth = 1;
			ctx.setLineDash([2, 2]);

			ctx.beginPath();

			// Horizontal grid lines
			for (let i = 0; i <= 4; i++) {
				const y = (i / 4) * height;
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);
			}

			// Vertical grid lines
			for (let i = 0; i <= 4; i++) {
				const x = (i / 4) * width;
				ctx.moveTo(x, 0);
				ctx.lineTo(x, height);
			}

			ctx.stroke();
			ctx.closePath();
		}

		if (dataBuffer.firstNode) {
			let avg: number = dataBuffer.averageValue;
			let node_iteration: number = 0;
			let current_node: DequeNode | null = dataBuffer.firstNode;

			dv = height / (2 * Math.abs(dataBuffer.averageValue) * valuePadding);
			dt = width / (dataBuffer.maximumLength - 1);

			ctx.strokeStyle = primaryColor;
			ctx.lineWidth = 2;
			ctx.setLineDash([]);

			ctx.beginPath();
			ctx.moveTo(0, height / 2 + (avg - current_node.value) * dv);

			while (current_node) {
				let current_value: number = current_node.value;
				let x = node_iteration * dt;
				let y = height / 2 + (avg - current_value) * dv;

				ctx.lineTo(x, y);
				current_node = current_node.next;
				node_iteration++;
			}

			ctx.stroke();
		}

		// Add span info to lower right corner
		ctx.fillStyle = gridColor;
		ctx.font = '12px Arial';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'bottom';
		const text = `Total span: x=${dataBuffer.spanSeconds.toFixed(2)} s, y=${(height / dv).toFixed(2)} ${sensorConfig.unit}`;
		ctx.fillText(text, width - 10, height - 10);

		// Add value average to upper right corner
		ctx.fillStyle = gridColor;
		ctx.font = '12px Arial';
		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		const avgText = `Average: ${dataBuffer.averageValue.toFixed(2)} ${sensorConfig.unit}`;
		ctx.fillText(avgText, width - 10, 10);
	}
</script>

<div class="chart-container">
	<div class="chart-controls">
		<div class="control-group">
			<label for="buffer-length">Buffer Length:</label>
			<select id="buffer-length" bind:value={bufferLength}>
				<option value={2}>2</option>
				<option value={10}>10</option>
				<option value={100}>100</option>
				<option value={400}>400</option>
				<option value={800}>800</option>
				<option value={1000}>1,000</option>
				<option value={4000}>4,000</option>
				<option value={10000}>10,000</option>
			</select>
		</div>

		<div class="control-group">
			<label for="value-padding">Vertical Zoom:</label>
			<select id="value-padding" bind:value={valuePadding}>
				<option value={0.01}>1%</option>
				<option value={0.1}>10%</option>
				<option value={0.25}>25%</option>
				<option value={0.5}>50%</option>
				<option value={1.0}>100%</option>
				<option value={2.0}>200%</option>
				<option value={3.0}>300%</option>
			</select>
		</div>

		<div class="control-group">
			<button class="clear-button" onclick={() => dataBuffer.clear()}> Clear </button>
		</div>
	</div>
	<canvas bind:this={canvas} class="sensor-chart"></canvas>
</div>

<style>
	.chart-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: 100%;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-xs);
	}

	.chart-controls {
		display: flex;
		gap: var(--space-md);
		align-items: center;
		padding: var(--space-sm);
		flex-wrap: wrap;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	label {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		white-space: nowrap;
		font-style: normal;
	}

	select {
		padding: var(--space-xs);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface-elevated);
		color: var(--color-text-primary);
		font-size: var(--text-sm);
		min-width: 120px;
	}

	select:hover {
		border-color: var(--color-border-hover);
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.clear-button {
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-primary);
		color: var(--color-text-primary);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.clear-button:hover {
		background: var(--color-primary-hover);
	}

	.clear-button:active {
		transform: translateY(1px);
	}

	.sensor-chart {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-elevated);
		display: block;
		width: 100%;
		height: auto;
		max-width: 100%;
		max-height: 100%;
	}
</style>
