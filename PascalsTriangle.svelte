<script>
  // A reactive state to hold the number of rows to display.
  // Initially, we show 5 rows.
  let rowsToShow = $state(5);
  // Reactive state for user input
  let inputRow = $state(0);
  let inputCol = $state(0);
  /
   * Generates the entire Pascal's triangle up to rowsToShow.
   * This is a "derived" state that re-computes whenever rowsToShow changes.
   */
  const triangle = $derived.by(() => {
    const t = [];
    for (let i = 0; i < rowsToShow; i++) {
      t[i] = [];
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          t[i][j] = 1;
        } else {
          t[i][j] = t[i - 1][j - 1] + t[i - 1][j];
        }
      }
    }
    return t;
  });
  /
   * Finds a specific value in the triangle based on user input.
   * This is a "derived" state that re-computes whenever inputRow or inputCol changes.
   */
  const specificValue = $derived(() => {
    // Check if input is valid before trying to access the array.
    if (inputRow < 0 || inputCol < 0 || inputCol > inputRow) {
      return "Invalid input";
    }
    return triangle[inputRow]?.[inputCol] ?? "Not in displayed triangle";
  });
  /**
   * Increases rowsToShow by 1 to display the next row of the triangle.
   */
  function showNextRow() {
    rowsToShow++;
  }
</script>
<div class="container">
  <h1>Pascal's Triangle with Svelte Runes</h1>
  <!-- Interactive controls -->
  <div class="controls">
    <button on:click={showNextRow}>Show Next Row</button>
    <div class="input-group">
      <input type="number" placeholder="Row" bind:value={inputRow} min="0" />
      <input type="number" placeholder="Column" bind:value={inputCol} min="0" />
      <p>Value at [{inputRow}, {inputCol}]: <b>{specificValue}</b></p>
    </div>
  </div>
  <!-- Display the triangle -->
  <div class="triangle-container">
    {#each triangle as row, rowIndex}
      <div class="row">
        {#each row as value, colIndex}
          <div class="cell">
            {value}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
<style>
  .container {
    text-align: center;
    font-family: sans-serif;
  }
  .controls {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  input {
    width: 80px;
    padding: 0.5rem;
    text-align: center;
  }
  button {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
  }
  .triangle-container {
    margin-top: 2rem;
    display: inline-block;
  }
  .row {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
  .cell {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: 
#f0f0f0;
    border-radius: 5px;
    margin: 0 5px;
  }
</style>
