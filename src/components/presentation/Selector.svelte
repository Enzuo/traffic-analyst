<script>
  import { createEventDispatcher } from "svelte"
  import Icon from "@/components/presentation/Icon.svelte"

  export let elements
  export let elementType
  export let selectedId

  const dispatch = createEventDispatcher()

  function handleElementSelect (index) {
    dispatch('select', {
      id : index
    })
  }


</script>

<div class="list">
  {#each elements as element, index}
  <div
    class="option {index===selectedId ? 'selected' : ''}"
    on:click={() => handleElementSelect(index)}
    on:keydown={() => handleElementSelect(index)}
  >
    {#if elementType === 'engine'}
      <Icon name=cog size={1.5}></Icon>
      <div class="label">
        {element.engine.name}
        <div class="sublabel">
          {element.engine.hp}hp {#if element.gearName}{element.gearName}{/if}
        </div>
      </div>
    {:else if elementType === 'config'}
      <Icon name=cog size={1.5}></Icon>
      <div class="label">
        {element.engine?.name}
        <div class="sublabel">
          {element.engine?.hp}hp {#if element.gearName}{element.gearName}{/if}
        </div>
      </div>
    {:else if elementType === 'trim'}
      <Icon name=truck size={1.5}></Icon>
      <div class="label">
        {element.trim}
      </div>
    {:else}
    <div class="label">
      {element.name}
    </div>
    {/if}
    <input name={elementType} type="radio" value={index} checked={index===selectedId}>

  </div>
  {/each}
</div>

<style>
  .selected {
    color: var(--primary);
  }

  .option {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top:0.8em;
  }

  .option .label {
    display:inline;
    padding-left:10px;
  }
  .option .sublabel {
    margin-top:0.5em;
    font-size:0.7rem;
  }

  .grid:focus-within {
    border:1px solid var(--primary)
  }

  input {
    position:absolute;
    left:-9999px;
  }
</style>