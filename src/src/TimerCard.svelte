<script>
    import {createEventDispatcher, onMount} from "svelte"
    import SubTimer from "./SubTimer.svelte";
    import Tooltip from "./Tooltip.svelte";

    const dispatch = createEventDispatcher();

    export let subTimersProps = [];
    export let groupName = "" // todo: make group name input focused onMount
    let displayTime = 0;
    let pause = false;

    onMount(() => {
        subTimersProps.forEach((timerProps) => {
            timerProps.firstLoad = true
        })
    })

    function randomName() {
        //let adjectives = ["Cool", "Dirty", "Broken", "Excellent", "Sweet", "Good", "Bad", "Righteous", "Neat"];
        let items = ["Scanners", "Scanguns", "Keyboards", "Servers", "Tablets", "Laptops", "PCs", "Microphones", "Printers", "Mice"];

        function randBetween(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        return items[randBetween(0, items.length - 1)];
    }

    setInterval(() => {
        subTimersProps.forEach((timerProps, i) => {
            if (timerProps.kill) {
                subTimersProps.splice(i, 1)
            }
        })

        let activatedAmt = 0;
        subTimersProps.forEach(timerProps => {
            if (timerProps.activated) {
                activatedAmt++;
            }
        })

        subTimersProps.forEach(timerProps => {
            if (timerProps.activated) {
                timerProps.ms += 25 / activatedAmt;
            }
        })

        let totalTime = 0;
        subTimersProps.forEach(timerProps => {
            totalTime += timerProps.ms;
        })

        // set proportions
        subTimersProps.forEach(timerProps => {
            if (subTimersProps.length === 1) {
                //timerProps.ms = (timerProps.ms / 2)
                return;
            }
            let secondsProportion = timerProps.ms / totalTime
            if (isNaN(secondsProportion)) secondsProportion = 0;
            timerProps.proportion = secondsProportion;
        })

        displayTime = msToTime(totalTime)
        subTimersProps = subTimersProps;
    }, 25)

    function setProportions() {

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

    function addTimer() {
        let newSeconds = subtractProportional(subTimersProps)
        let props = {
            activated: true,
            ms: newSeconds,
            kill: false,
            displayAreYouSure: false,
            name: "",
            index: subTimersProps.length,
        }
        subTimersProps = [...subTimersProps, props];
    }

    // Subtracts a proportional amount from each timer and returns what the new timer should be set to.
    function subtractProportional(timersProps) {
        let totalTime = 0;
        timersProps.forEach((props) => {
            totalTime += props.ms;
        })

        let newTimerSeconds = 0;

        timersProps.forEach(timer => {
            if (timersProps.length === 1) {
                timer.ms = (timer.ms / 2)
                newTimerSeconds = (timer.ms / 2);
                return;
            }
            let secondsProportion = timer.ms / totalTime
            if (isNaN(secondsProportion)) secondsProportion = 0;

            let subtractBy = Math.ceil(secondsProportion * timer.ms)
            timer.ms = timer.ms - subtractBy
            newTimerSeconds += subtractBy;
        })

        newTimerSeconds = newTimerSeconds / 2

        // put half of newTimerSeconds back amongst the incumbent timers
        timersProps.forEach(timer => {
            timer.ms = timer.ms + ((timersProps.length + 1) / 2)
        })

        return newTimerSeconds
    }

    function deactivateAll() {
        subTimersProps.forEach(timerProps => {
            timerProps.activated = false
            pause = true;
        })
    }

    function activateAll() {
        subTimersProps.forEach(timerProps => {
            pause = false;
            timerProps.activated = true
        })
    }

    function handleDivDelete(e) {
        let divAmount = e.detail.ms / (subTimersProps.length - 1);
        console.log("div del detected", subTimersProps.length - 1, {divAmount}, e.detail.ms, e.detail.ms / subTimersProps.length - 1)

        subTimersProps.forEach((timerProps, i) => {
            if (i === e.detail.index) return;
            timerProps.ms += divAmount;
        })
        e.detail.killFunc();
        subTimersProps = subTimersProps;
    }

    function fireDeleteEvent() {
        if (confirm("Are you sure want to delete this group?")) {
            dispatch("delete")
        }
    }
</script>

<div>
    <label>
        Group Name:
        <input type="text" bind:value={groupName} placeholder="Group Name">
    </label>

    <button id="exit" on:click={fireDeleteEvent}>&times;</button>

    <h2>Total Time: {displayTime}</h2>
    <h5>Every second is divided amongst all sub-timers.<br>This helps when doing multiple CNs at once.</h5>

    <Tooltip text="New timers take a proportional amount of time from each sub-timer. "><button on:click={addTimer}>Add Sub-timer</button></Tooltip>
    {#if pause}
        <button on:click={activateAll}>Start All</button>
    {:else}
        <button on:click={deactivateAll}>Pause All</button>
    {/if}
        {#each subTimersProps as props}
            <SubTimer
                    bind:activated={props.activated}
                    bind:ms={props.ms}
                    bind:kill={props.kill}
                    bind:name={props.name}
                    index={props.index}
                    bind:proportion={props.proportion}
                    bind:firstLoad={props.firstLoad}
                    on:divdelete={handleDivDelete}
            ></SubTimer>
        {/each}
</div>

<style>
    div {
        position: relative;
        outline: 1px solid black;
        width: fit-content;
        margin: 10px;
        padding:10px;
    }
    h2 {
        margin-bottom: 0;
    }
    h5 {
        margin-top: 1em;
    }
    #exit {
        position:absolute;
        right: 0;
        top: 0;
    }
</style>