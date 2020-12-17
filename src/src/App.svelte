<script>
	import SubTimer from "./SubTimer.svelte";
	import TimerCard from "./TimerCard.svelte";

	export let name;
</script>

<main>
	<TimerCard></TimerCard>
	<br>
	<br>
	<SubTimer></SubTimer>
</main>