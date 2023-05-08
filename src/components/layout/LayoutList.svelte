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
    position:relative;
  }

  .layout-row {
    display:flex;
    flex-direction: row;
    /* height:100%; */
    overflow:hidden;
  }

  .list {
    border-right:3px solid var(--secondary);
    /* height:100%; */
    flex-grow:3;
    overflow-y:scroll;
    overflow-x:hidden;
  }

  .content {
    /* height:100%; */
    flex-grow:1;
    overflow-y:scroll;
    overflow-x:hidden;
  }

</style>