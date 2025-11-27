<script lang='ts'>
  let count = $state(0);

  function incrementCount () {
      count += 1;
    }
</script>

<p>Counter: {count}</p>
<button onclick={incrementCount}>+1</button>
