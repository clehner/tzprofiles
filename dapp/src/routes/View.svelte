<script lang="ts">
  import { onMount } from 'svelte';
  import { useParams } from 'svelte-navigator';
  import { searchClaims, searchAddress, defaultSearchOpts, search, network } from 'src/store';
  import type NetworkType from 'enumsNetworkType';
  import { BasePage, ViewProfile, SpinnerIcon } from 'components';

  const params = useParams();
  if ($params.address) {
    searchAddress.set($params.address);
  }

  $: fetching = false;

  onMount(() => {
    // TODO: Generalize over claim types?
    if (!$searchClaims?.basic.content || !$searchClaims?.twitter.content) {
      network.set(
        ($params.network as NetworkType) || ('mainnet' as NetworkType)
      );
      fetching = true;
      search($params.address, defaultSearchOpts).finally(
        () => { 
          fetching = false;
        }
      );
    }
  });
</script>

<BasePage class="justify-center flex-col">
  {#if fetching}
    <div class="items-center justify-center w-full mb-8 flex">
      <SpinnerIcon class="animate-spin w-8 h-8 text-center mr-6" />
      Loading profile
    </div>
  {/if}
  <ViewProfile
    claimsMap={searchClaims}
    address={$searchAddress}
    network={$params.network}
  />
</BasePage>
