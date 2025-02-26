<script lang="ts">
  import { onMount } from 'svelte';
  import { IconLink, DownloadIcon } from 'components';
  import { claimsStream, loadingContracts, localKepler } from 'src/store';

  const makeDownloadable = (obj: any): string => {
    let stringify = JSON.stringify(obj, null, 2);
    let encoded = encodeURIComponent(stringify);
    return `data:application/json;charset=utf-8,${encoded}`;
  };

  let data: any[] = [];

  onMount(async () => {
    try {
      if (
        Object.values($claimsStream).every(
          (claim) => !claim.content && !claim.preparedContent
        )
      ) {
        data = [];
      } else {
        data = await Promise.all(
          Object.values($claimsStream)
            // TODO: Distinguish between content and preparedContent in UI
            .filter((claim) => claim.content || claim.preparedContent)
            .map(async (claim) => {
              // TODO: Distinguish between content and preparedContent in UI
              let json = makeDownloadable(
                claim.content || claim.preparedContent
              );
              return { ...claim, json };
            })
        );
      }
    } catch (err) {
      console.error(`Died in MyCredentials OnMount ${err.message}`);
    }
  });
</script>

<div class="flex flex-col my-8">
  <h3 class="mb-4 text-xl">{'My Credentials'}</h3>
  {#if $loadingContracts}
    <h4>{'Loading...'}</h4>
  {:else if data.length === 0}
    <h4>{'None Currently Available'}</h4>
  {:else}
    <table class="table-auto">
      <thead>
        <th>NAME</th>
        <th>TYPE</th>
        <th>PROOF</th>
      </thead>
      <tbody>
        {#each data as claim}
          <tr>
            <td
              class="flex items-center px-2 my-1 cursor-pointer sm:px-4 md:px-6"
            >
              <svelte:component
                this={claim.display.icon}
                class="w-10 h-12 mr-3 sm:w-4 sm:h-4"
              />
              <p class="font-bold">{claim.display.display}</p>
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.type}
            </td>
            <td class="px-2 sm:px-4 md:px-6">
              {claim.display.proof}
            </td>
            <td>
              <IconLink
                class="block w-10 h-12 mr-3 sm:w-4 sm:h-4"
                icon={DownloadIcon}
                href={claim.json}
                download={`${claim.display.display}.json`}
              />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
