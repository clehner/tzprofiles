<script lang="ts">
  export { clazz as class };
  let clazz: string = '';
</script>

<div
  class="flex flex-col rounded-xl border border-gray-350 px-6 pb-6 pt-10 bg-white text-gray-650 {clazz}"
>
  <slot />
</div>
