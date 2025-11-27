<!-- src/lib/AccordionItem.svelte  -->
<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  // $props() defines the component's props. the `open` prop is made bindable,
  // allowing the child to update the parent's state.
  let { title, open = $bindable(false) } = $props();
</script>
