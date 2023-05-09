<script>

  /** @type {Array<{label:string, units?:string}>}  */
  export let rows
  /** @type {Array<{label:string}>}  */
  export let columns
  /** @type {Array<string|number>[]} */
  export let data

</script>

<table>
	<thead>
    <tr>
      <th>-</th>
			{#each columns as col}
        <th>{col.label}</th>
			{/each}
      <th>-</th>
    </tr>
	</thead>

  <tbody>
		{#each rows as row, index}
      <tr>
        <td>{row.label}</td>
				{#each data as col}
					<td>{col[index]}</td>
				{/each}
        <td>{row.units ? row.units : ''}</td>
      </tr>
		{/each}
	</tbody>


</table>

<style>
  th, td {
    padding:1em;
  }
  tr:nth-child(even)
  {
    background-color: var(--neutral-light);
  }
</style>