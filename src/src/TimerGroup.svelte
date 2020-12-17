<script>
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
        console.log({newSeconds})
        let props = {
            activated:true,
            ms:newSeconds,
            kill: false,
            displayAreYouSure: false,
            name: "",
            index: subTimersProps.length,
        }
        subTimersProps.push(props)
        console.log("pushed", subTimersProps)
        subTimersProps = subTimersProps;
    }

    // Subtracts a proportional amount from each timer and returns what the new timer should be set to.
    function subtractProportional(timersProps) {
        // let timerProps = [];
        // Object.assign(timerProps, timerProps)

        let totalTime = 0;
        timersProps.forEach((props) => {
            totalTime += props.ms;
        })

        //let propsSubtractBy = []
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

    $: {
        // todo: delete timer code here
        // subTimersProps.forEach((props, i) => {
        //     if(props.kill === true) {
        //         subTimersProps.splice(i,1)
        //     }
        // })
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
    // (e) => {props[e.index].seconds = e.currentSeconds}
</script>

<div>
    <input type="text" placeholder="Group Name">

    {#if pause}
        <button on:click={activateAll}>Start All</button>
    {:else}
        <button on:click={deactivateAll}>Pause All</button>
    {/if}
    <h2>{displayTime}</h2>
    <button on:click={addTimer}>Add Timer</button>
        {#each subTimersProps as props (props.index)}
            <SubTimer
                    bind:activated={props.activated}
                    ms={props.ms}
                    bind:kill={props.kill}
                    displayAreYouSure={props.displayAreYouSure}
                    bind:name={props.name}
                    index={props.index}
            ></SubTimer>
        {/each}
</div>

<style>
    div {
        outline: 1px solid black;
        width: fit-content;
    }
</style>