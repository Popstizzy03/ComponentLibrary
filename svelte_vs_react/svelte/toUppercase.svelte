<script lang="ts">
   let { value = $bindable() } = $props()

   let uppercase = {
      get value() {
          return value.toUpperCase()
        },
        set value(v) {
            value = v.toUpperCase()
          }
    }
<script>

<input bind:value = {uppercase.value} type="text" />
