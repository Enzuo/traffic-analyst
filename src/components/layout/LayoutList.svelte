<script>



</script>


<div class="layout">
  <div class="side-bar">
    <slot name="side-bar"></slot>
  </div>

  <div class="layout-row">
    <div class="list">
      <slot name="list"></slot>
    </div>

    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</div>


<style>
  .layout {
    display:flex;
    flex-direction: column;
    height:100%;
  }

  .layout-row {
    display:flex;
    flex-direction: row;
  }

  .list {
    border-right:3px solid var(--secondary);
    height:100%;
    flex-grow:3;
  }

  .content {
    height:100%;
    flex-grow:1;
  }

</style>