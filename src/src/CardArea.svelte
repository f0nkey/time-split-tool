<script>
    import TimerCard from "./TimerCard.svelte";
    export let cardsProps = [];

    function deleteCard(index) {
        cardsProps.splice(index,1)
        cardsProps = cardsProps
    }

    setInterval(()=>{
        console.log({cardsProps})
    }, 1000)

    function newCardProps() {
        return {subTimersProps:[], groupName:""}
    }
</script>

<div id="root">
    {#each cardsProps as cp, i}
        <TimerCard bind:groupName={cp.groupName} bind:subTimersProps={cp.subTimersProps} on:delete={()=>{deleteCard(i)}}></TimerCard>
    {/each}
    <div on:click={()=>{cardsProps = [...cardsProps, newCardProps()]}} id="new-card-container">
        <button id="add-btn"><i class="fas fa-plus fa-1x"></i></button>
        <p>Add Timer Card</p>
    </div>
</div>

<style>
    #root {

    }
    #new-card-container {
        width: 200px;
        background-color: grey;
        text-align: center;
        cursor: pointer;
    }
    #add-btn {
        font-size:10em;
        line-height: 1;
        margin: 0;
        padding: 0;
        background: none;
        outline: none;
        border: none;
    }
</style>