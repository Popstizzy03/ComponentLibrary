<script lang='ts'>
  const colors = ['red', 'green', 'blue', 'yellow'];
</script>

<ul>
  {#each colors as color (color)}
    <li>{ color }</li>
  {/each}
</ul>
