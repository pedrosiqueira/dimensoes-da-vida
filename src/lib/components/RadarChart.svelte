<script lang="ts">
	import {
		Chart,
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler,
		Tooltip,
		Legend
	} from 'chart.js';
	import type { ChartData, ChartOptions } from 'chart.js';

	Chart.register(
		RadarController,
		RadialLinearScale,
		PointElement,
		LineElement,
		Filler,
		Tooltip,
		Legend
	);

	let { data, options }: { data: ChartData<'radar'>; options?: ChartOptions<'radar'> } = $props();

	let canvas: HTMLCanvasElement;
	let chartInstance: Chart<'radar'> | undefined;

	$effect(() => {
		if (!canvas) return;
		chartInstance = new Chart(canvas, { type: 'radar', data, options });
		return () => chartInstance?.destroy();
	});

	$effect(() => {
		if (!chartInstance) return;
		chartInstance.data = data;
		if (options) chartInstance.options = options;
		chartInstance.update();
	});
</script>

<div class="relative mx-auto h-64 w-full max-w-md sm:h-80 md:h-96">
	<canvas bind:this={canvas} aria-label="Gráfico radar"></canvas>
</div>
