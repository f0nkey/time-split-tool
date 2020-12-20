<script>
	import CardArea from "./CardArea.svelte";
	import cookies from "js-cookie"
	import {lastCookieUpdate, loadedPage} from './store.js';
	import Modal from "./Modal.svelte";
	import About from "./About.svelte";

	let showAbout = false

	let currCookie = function () {
		let c = cookies.get("cardsProps") ?? "[]";
		return JSON.parse(c);
	}()

	let cardsProps = currCookie.cardsProps;
	$lastCookieUpdate = currCookie.lastUpdate;

	setInterval(() => {
		cookies.set("cardsProps", {cardsProps: cardsProps, lastUpdate: Date.now()}, {expires: 1000});
	}, 250)

	$loadedPage = true;
</script>

<main>
	<div>
		<h1>F0nkey's Split Timer Tool</h1>
		<Modal bind:show={showAbout} heading="About">
			<About></About>
		</Modal>
		<button style="background-color:#42cc8c;" on:click={()=>{showAbout = true}}>About</button>
	</div>

	<CardArea bind:cardsProps={cardsProps}></CardArea>
</main>

<style>
	div {
		text-align: center;
	}
	h1 {
		margin-bottom: 20px;
	}
	button {
		display: inline-block;
		padding: 0.46em 1.6em;
		border: 0.1em solid #000000;
		margin: 0 0.2em 0.2em 0;
		border-radius: 0.12em;
		box-sizing: border-box;
		text-decoration: none;
		font-weight: 300;
		color: #000000;
		text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35);
		background-color: #FFFFFF;
		text-align: center;
		transition: all 0.15s;
	}
	button:hover{
		text-shadow: 0 0 2em rgba(255,255,255,1);
		color: #FFFFFF;
		border-color: #FFFFFF;
		font-weight: bold;
	}
</style>