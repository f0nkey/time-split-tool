<script>
    import {createEventDispatcher} from "svelte"
    const dispatch = createEventDispatcher();

    import SubTimer from "./SubTimer.svelte";
    let displayTime = 0;
    let subTimersProps = [];

    let pause = false;

    setInterval(() => {
        subTimersProps.forEach((timerProps, i)=> {
            if(timerProps.kill) {
                subTimersProps.splice(i, 1)
            }
        })

        let activatedAmt = 0;
        subTimersProps.forEach(timerProps => {
            if(timerProps.activated) {
                activatedAmt++;
            }
        })

        subTimersProps.forEach(timerProps => {
            if(timerProps.activated) {
                timerProps.ms += 25/activatedAmt;
            }
        })

        let sum = 0;
        subTimersProps.forEach(timerProps => {
            sum += timerProps.ms;
        })

        displayTime = msToTime(sum)
        subTimersProps = subTimersProps;
    }, 25)

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
            activated:true,
            ms:newSeconds,
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

        timersProps.forEach( timer => {
            if(timersProps.length === 1) {
                timer.ms = (timer.ms / 2)
                newTimerSeconds = (timer.ms / 2);
                return;
            }
            let secondsProportion = timer.ms / totalTime
            if(isNaN(secondsProportion)) secondsProportion = 0;

            let subtractBy = Math.ceil(secondsProportion * timer.ms)
            timer.ms = timer.ms - subtractBy
            newTimerSeconds += subtractBy;
        })

        newTimerSeconds = newTimerSeconds / 2

        // put half of newTimerSeconds back amongst the incumbent timers
        timersProps.forEach( timer => {
            timer.ms = timer.ms + ((timersProps.length+1)/2)
        })

        return newTimerSeconds
    }

    function deactivateAll() {
        subTimersProps.forEach( timerProps => {
            timerProps.activated = false
            pause = true;
        })
    }

    function activateAll() {
        subTimersProps.forEach( timerProps => {
            pause = false;
            timerProps.activated = true
        })
    }

    function handleDivDelete(e) {
        let divAmount = e.detail.ms / (subTimersProps.length-1);
        console.log("div del detected", subTimersProps.length-1, {divAmount}, e.detail.ms, e.detail.ms / subTimersProps.length-1)

        subTimersProps.forEach( (timerProps, i) => {
            if(i === e.detail.index) return;
            timerProps.ms += divAmount;
        })
        e.detail.killFunc();
        subTimersProps = subTimersProps;
    }

    function fireDeleteEvent() {
        dispatch("deleteMe")
    }
</script>

<div>
    <input type="text" placeholder="Group Name">

    {#if pause}
        <button on:click={activateAll}>Start All</button>
    {:else}
        <button on:click={deactivateAll}>Pause All</button>
    {/if}
    <button on:click={fireDeleteEvent}>Delete Group</button>

    <h2>{displayTime}</h2>
    <button on:click={addTimer}>Add Timer</button>
        {#each subTimersProps as props}
            <SubTimer
                    bind:activated={props.activated}
                    ms={props.ms}
                    bind:kill={props.kill}
                    displayAreYouSure={props.displayAreYouSure}
                    bind:name={props.name}
                    index={props.index}
                    on:divdelete={handleDivDelete}
            ></SubTimer>
        {/each}
</div>

<style>
    div {
        outline: 1px solid black;
        width: fit-content;
    }
</style>