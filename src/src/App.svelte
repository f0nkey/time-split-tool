<script>
	import SubTimer from "./SubTimer.svelte";
	import TimerGroup from "./TimerGroup.svelte";

	export let name;
</script>

<main>
	<TimerGroup></TimerGroup>
	<SubTimer></SubTimer>
	<SubTimer></SubTimer>
	<SubTimer></SubTimer>
	<SubTimer></SubTimer>
	<SubTimer name="123457" activated=true></SubTimer>
</main>