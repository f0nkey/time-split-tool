<script>
    export let heading = "Default Heading"
    export let show = false;
</script>

{#if show}
    <div class="dark-bg">
        <div class="popup">
            <div class="heading-container">
                <h1>{heading}</h1>
            </div>
            <div class="content">
                <slot></slot>
            </div>
            <div class="top-right">
                <button class="exit-button" on:click={()=>{show = false}}>&times;</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .content {
        overflow: auto;
    }
    .dark-bg {
        display:block;
        position: fixed;
        top:0;
        background-color: rgba(0,0,0,0.75);
        width: 100%;
        height: 100%;
        z-index: 2;
    }
    .heading-container {
        border-bottom: 1px solid black;
    }
    .popup {
        width: 95%;
        height: 75%;
        margin: 0 auto;
        margin-top: 30px;
        text-align: center;
        background-color: white;
        border: 2px solid black;
        display: grid;
        grid-template-rows: 70px 1fr;
        position: relative;
        padding:25px;
    }
    .top-right {
        position: absolute;
        right: 0;
        top: 0;
    }
    .exit-button {
        padding: 5px;
        margin: 5px 5px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 2px;

        color: white;
        background-color: black;
        outline: none;
    }

    .exit-button:hover {
        filter:invert(1);
    }
</style>