<script lang="ts">
  let pageTitle = $state("")
  $effect (() => {
      pageTitle = document.title;
    });
</script>

<p>Page Title: {pageTitle}</p>
