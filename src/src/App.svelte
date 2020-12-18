<script>
	import CardArea from "./CardArea.svelte";
	import cookies from "js-cookie"
	import {lastCookieUpdate, loadedPage} from './store.js';


	//cookies.remove('cardsProps')

	let currCookie = function() {
		let c = cookies.get("cardsProps") ?? "[]";
		return JSON.parse(c);
	}()

	let cardsProps = currCookie.cardsProps;
	$lastCookieUpdate = currCookie.lastUpdate;

	setInterval(() => {
		cookies.set("cardsProps", {cardsProps: cardsProps, lastUpdate: Date.now()}, { expires: 1000 });
	}, 250)

	$loadedPage = true;
</script>

<main>
	<CardArea bind:cardsProps={cardsProps}></CardArea>
</main>