<script lang="ts">
  import { Input, Label } from 'src/components';
  import { ClaimLinkInput } from 'src/components/claims';
  import type { EthereumDraft, Claim } from 'src/helpers';

  export let ethereumClaim: Claim;
  $: display = ethereumClaim.display;
  $: draft = ethereumClaim.draft as EthereumDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="ethereum-wallet" value="Ethereum Wallet" />
    {#if draft.wallet}
      <p class="text-sm text-gray-350 italic mt-2">(self-attested)</p>
    {/if}
  </div>
  {#if draft.wallet}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="ethereum-wallet"
        value={draft.wallet}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>
