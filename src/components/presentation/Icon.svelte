<script>
  export let name
  export let size = 1



</script>

<svg class="icon icon-{name}" style={`width: ${1*size}em; height: ${1*size}em;`}><use xlink:href="symbol-defs.svg#icon-{name}"></use></svg>


<style>
  .icon {
    display: inline-block;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor;
  }
</style>
