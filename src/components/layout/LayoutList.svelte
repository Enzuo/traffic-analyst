<script>



</script>


<div class="layout">
  <div class="side-bar">

  </div>


  <div class="list">
    <slot name="list"></slot>
  </div>

  <div class="content">
    <slot name="content"></slot>
  </div>
</div>


<style>
  .layout {
    display:flex;
    flex-direction: row;
    height:100%;
  }

  .list {
    border-right:3px solid var(--secondary);
    height:100%;
    flex-grow:3;
  }

  .content {
    background:lightblue;
    height:100%;
    flex-grow:1;
  }

</style>