<script>
    import {createEventDispatcher} from 'svelte';
    import {loadedPage} from "./store"
    import {lastCookieUpdate} from "./store";
    import Tooltip from "./Tooltip.svelte";

    const dispatch = createEventDispatcher();

    // todo: include notes for this

    export let activated = false
    export let ms = 0 // can be a float
    export let kill = false;
    export let name = "";
    export let index = 0;
    export let proportion = 1; // proportion of ms to full group's time
    export let firstLoad = null; // set by the parent object
    $: displaySeconds = msToTime(ms)

    $: {
        if(firstLoad && activated) {
            let diff = Date.now() - $lastCookieUpdate;
            let amtToAdd = proportion * diff;
            console.log({diff}, {proportion}, {diff}, {amtToAdd})
            ms += amtToAdd
            firstLoad = false;
        }
    }

    function msToTime(s) {
        // Pad to 2 or 3 digits, default is 2
        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(Math.round(ms), 3);
    }

    function divDelete() {
        dispatch("divdelete", {ms: ms, index: index, killFunc: () =>{kill = true}})
    }

    let tickerHandle = 0;
</script>

<div class="container">
    <input type="text" bind:value={name} placeholder="Control #">
    <span>{displaySeconds}</span>
    {#if activated}
        <button id="stop" on:click={() => {activated = false}}>STOP</button>
    {:else}
        <button id="start" on:click={() => {activated = true}}>START</button>
    {/if}
    <button class="delete" on:click={() => {kill = true}}>DELETE</button>
    <Tooltip text="Divide time amongst siblings after deletion." dir="left">
        <button class="delete" on:click={divDelete}>DELETE & &div;</button>
    </Tooltip>
</div>

<style>
    .container {
        position: relative;
        display: grid;
        align-items: center;
        justify-items: center;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        background-color: lightgray;
        justify-content: center;
        border: 1px solid grey;
        width: 100%;
    }
    span {
        margin: 10px;
    }
    button {
        margin: 2px auto;
        color: #fff;
        border: none;
        border-radius: 5px;
        width: fit-content;
        font-size: 0.8em;
        padding: 0.5em;
    }
    input {
        margin: auto;
        padding-top: 5px;
        padding-left: 5px;
        width: 6em;
    }
    #start {
        background-color: forestgreen;
    }
    #stop {
        background: red;
    }
    .delete {
        background: darkred;
    }
</style>



