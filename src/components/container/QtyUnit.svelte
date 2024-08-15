<script lang="ts">
  import { convertQty } from "@/logic/carLogic/carlib";

  export let value : number
  export let unit : string
  export let fromUnit : string = null
  export let precision = 2

  let qty = convertQty(value, unit, fromUnit)
</script>

<div >
  <div class="value">{qty.value.toFixed(precision)}</div>
  <div class="unit">{qty.unit}</div>
</div>