<script>
    import TimerCard from "./TimerCard.svelte";
    let cardProps = [1];

    function deleteCard(index) {
        cardProps.splice(index,1)
        cardProps = cardProps
    }

    function newCardProps() {
        return {subTimersProps:{}}
    }
</script>

<div id="root">
    {#each cardProps as cp, i}
        <TimerCard bind:subTimersProps={cp.subTimersProps} on:delete={()=>{deleteCard(i)}}></TimerCard>
    {/each}
    <div on:click={()=>{cardProps = [...cardProps, newCardProps()]}} id="new-card-container">
        <button id="add-btn">+</button>
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