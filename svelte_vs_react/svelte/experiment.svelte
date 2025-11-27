<script lang="js">
   let count = $state(0)

	function decrement() {
		return count -= 1
	}

   function increment() {
		 return count += 1 
   }

	const story = document.body.querySelector(".story");

	const setText = document.body.querySelector("#addText");
	addText.addEventListener('click', () => {
		story.textContent = "Hello"
	})
</script>

<button onclick = {increment}>
   <h1>Increment ➕</h1>
</button>

<button onclick = {decrement}>
	<h1>Decrement ➖</h1>
</button>

<p> clicks: {count}</p>
<div>
	<textarea id="story"></textarea>
	<button id="set-text" type="button">Set Text</button>
	<button id="clear-text" type="button">Clear Text</button>
</div>

{#if count == 11}
	<p>What made you click the button more than 10 times?</p>
{:else if count < -10}
	<p>Are you planning to get to negaive infinity? 😄</p>
{:else if count == 15}
	<p> You're still going huh???</p>
{/if}

<style>
	button {
		background: purple;
		color: #fff;
		border: 1px solid white;
		padding: 18px;
		border-radius: 18px;
	}
</style>
