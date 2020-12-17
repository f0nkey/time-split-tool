<script>
    export let text = ""
    export let dir = "left"
</script>

<div class="parent">
    <slot></slot>
    {#if dir === "left"}
        <span class="tooltiptext">{text}</span>
    {:else}
        <span style="right:80px;" class="tooltiptext other">{text}</span>
    {/if}

</div>

<style>
    .parent:hover .tooltiptext {
        display: inline-block;
    }
    .tooltiptext {
        display: none;
        background: black;
        color:white;
        border-radius: 5px;
        padding: 10px;
        position: absolute;
        z-index: 1000;
        font-size: 1em;
        width: fit-content;
    }

    .parent {
        width:fit-content;
        display:inline;
    }
</style>