<script lang="ts">
  import Basic from './Basic.svelte';
  import Twitter from './Twitter.svelte';
  import type { Claim } from 'src/helpers';

  export let claim: Claim;
</script>

{#if claim?.type === 'basic'}
  <Basic basicClaim={claim} />
{:else if claim?.type === 'twitter'}
  <Twitter twitterClaim={claim} />
{:else}
  <div>Unknown claim type: {claim?.type}</div>
{/if}
