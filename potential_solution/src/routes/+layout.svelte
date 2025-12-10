<script lang="ts">
	import { env } from '$env/dynamic/public';
	import alarm_favicon from '$lib/assets/alarm_favicon.ico';
	import connected_favicon from '$lib/assets/connected_favicon.ico';
	import disconnected_favicon from '$lib/assets/disconnected_favicon.ico';
	import { SensorConfig } from '$lib/classes/SensorConfig';
	import { SensorData } from '$lib/classes/SensorData';
	import { onMount, setContext } from 'svelte';
	import '../lib/styles/themes.css';

	let { children } = $props();

	// Configuration from environment variables
	const wellName = env.PUBLIC_WELL_NAME || 'HMI';

	// WebSocket management
	let connected: boolean = $state(false);
	let sensorData: SensorData = $state(new SensorData());
	let timeStampEpoch: number = $state(0);
	let ws: WebSocket | null = null;

	function connect() {
		const wsUrl = 'wss://frontend-dev-interview-challenge-production.up.railway.app/ws';
		ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			connected = true;
		};

		ws.onmessage = (event) => {
			sensorData = SensorData.fromWebSocket(JSON.parse(event.data));
			timeStampEpoch = sensorData.timestamp.getTime();
		};

		ws.onclose = () => {
			connected = false;
		};

		ws.onerror = (error) => {
			console.error('WebSocket Error:', error);
		};
	}

	function disconnect() {
		if (ws) {
			ws.close();
			ws = null;
		}
	}

	onMount(() => {
		connect();
		return () => disconnect();
	});

	// Global data states
	let alarmStatus = $derived(sensorData.alarmStatus);
	let tabTitle = $derived(
		connected ? `Well ${wellName}: ${alarmStatus}` : `Well ${wellName}: Disconnected`
	);

	// TODO: read sensor configs from API request to PLC backend
	let flowConfig: SensorConfig = $state(
		new SensorConfig({
			label: 'Flow',
			unit: 'gpm',
			precision: 0,
			lo: 500,
			hi: 1200,
			hiHi: 1225
		})
	);
	let powerConfig: SensorConfig = $state(
		new SensorConfig({
			label: 'Power',
			unit: 'kW',
			precision: 1,
			lo: undefined,
			hi: 550.0,
			hiHi: 575.0
		})
	);
	let pressurePSIConfig: SensorConfig = $state(
		new SensorConfig({
			label: 'Pressure',
			unit: 'psi',
			precision: 1,
			loLo: 80.0,
			lo: 90.0,
			hi: 100.0,
			hiHi: 120.0
		})
	);
	let pressureBarConfig: SensorConfig = $state(
		new SensorConfig({
			label: 'Pressure',
			unit: 'bar',
			precision: 2,
			loLo: 0.1,
			lo: 1.0,
			hi: 9.5,
			hiHi: 9.8
		})
	);

	// Theme management
	type Theme = 'dark' | 'light';
	let themeProperties: Record<string, string> = $state({});
	let currentTheme = $state<Theme>('dark');
	let isLightMode = $derived(currentTheme === 'light');

	function setTheme(theme: Theme) {
		document.documentElement.setAttribute('hmi-theme', theme);
		currentTheme = theme;

		let computedStyle = getComputedStyle(document.documentElement);
		let newThemeProperties: Record<string, string> = {};

		for (const propName of computedStyle) {
			if (propName.startsWith('--')) {
				const camelKey = propName
					.slice(2)
					.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

				newThemeProperties[camelKey] = computedStyle.getPropertyValue(propName).trim();
			}
		}

		themeProperties = newThemeProperties;

		localStorage.setItem('theme', theme);
	}

	function toggleTheme() {
		setTheme(currentTheme === 'dark' ? 'light' : 'dark');
	}
	onMount(() => {
		const savedTheme = localStorage.getItem('theme') as Theme;
		if (savedTheme && (['dark', 'light'] as const).includes(savedTheme)) {
			setTheme(savedTheme);
		}
	});

	// Provide state to child components
	setContext('globalState', {
		wellName,
		flowConfig: () => flowConfig,
		powerConfig: () => powerConfig,
		pressurePSIConfig: () => pressurePSIConfig,
		pressureBarConfig: () => pressureBarConfig,
		themeProperties: () => themeProperties,
		connected: () => connected,
		sensorData: () => sensorData,
		timeStampEpoch: () => timeStampEpoch,
		connect,
		disconnect
	});
</script>

<svelte:head>
	<title>{tabTitle}</title>
	<link
		rel="icon"
		href={connected
			? sensorData?.sensor_alarm
				? alarm_favicon
				: connected_favicon
			: disconnected_favicon}
	/>
</svelte:head>

<header class="app-header">
	<h1 class="app-title">
		{connected
			? sensorData?.sensor_alarm
				? `⚠️ Well ${wellName}`
				: `✅ Well ${wellName}`
			: `❌ Well ${wellName}`}
	</h1>
	<div class="header-controls">
		<div class="theme-switcher">
			<span class="theme-label">🌙</span>

			<label class="switch">
				<input type="checkbox" checked={isLightMode} onchange={toggleTheme} />
				<span class="slider"></span>
			</label>

			<span class="theme-label">☀️</span>
		</div>
	</div>
</header>

<main class="app-content">
	{@render children()}
</main>

<style>
	/* Basic global styles - colors are in themes.css */
	:global(body) {
		margin: 0;
		padding: 0;
		background: var(--color-background);
		color: var(--color-text-primary);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm);
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		gap: var(--space-md);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.app-title {
		color: var(--color-text-primary);
		margin: 0;
		font-size: var(--text-xl);
		font-weight: 600;
		flex: 1;
	}

	.header-controls {
		flex-shrink: 0;
	}

	.app-content {
		flex: 1;
	}

	.theme-switcher {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.theme-label {
		font-size: var(--text-lg);
		user-select: none;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-border);
		transition: 0.4s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: var(--color-text-primary);
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: var(--color-primary);
	}

	input:focus + .slider {
		box-shadow: 0 0 1px var(--color-primary);
	}

	input:checked + .slider:before {
		transform: translateX(26px);
	}

	.slider:hover {
		background-color: var(--color-border-hover);
	}

	input:checked + .slider:hover {
		background-color: var(--color-primary-hover);
	}

	/* Stack header items on small screens */
	@media (max-width: 370px) {
		.app-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.header-controls {
			align-self: flex-end;
		}
	}
</style>
