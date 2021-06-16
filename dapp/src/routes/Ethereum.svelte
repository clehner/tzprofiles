<script lang="ts">
  import { BasePage, Select, Option, PrimaryButton } from 'components';

  import { completeIssueCredential, prepareIssueCredential } from 'didkit-wasm';

  import { alert, claimsStream, userData, wallet } from 'src/store';
  import { v4 as uuid } from 'uuid';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  import { onMount } from 'svelte';
  import { contentToDraft } from 'src/helpers';

  $: account = false;
  $: accounts = [];
  $: complete = false;
  $: eth = false;
  $: loaded = false;

  onMount(async () => {
    if (window.ethereum) {
      eth = window.ethereum;
      accounts = await eth.request({ method: 'eth_requestAccounts' });
    }
    loaded = true;
  });

  const issue = async () => {
    if (!account) {
      alert.set({
        message: 'No ethereum account selected',
        variant: 'error',
      });
      return;
    }

    let vcStr = await signEthereumClaim();

    let nextClaimMap = $claimsStream;
    nextClaimMap.ethereum.preparedContent = JSON.parse(vcStr);
    nextClaimMap.ethereum.draft = contentToDraft(
      'ethereum',
      nextClaimMap.ethereum.preparedContent
    );

    claimsStream.set(nextClaimMap);

    alert.set({
      message: "You've completed the Ethereum Control Claim successfully!",
      variant: 'success',
    });

    complete = true;
  };

  const signEthereumClaim = async (): Promise<string> => {
    if (!account) {
      alert.set({
        message: 'No ethereum account selected',
        variant: 'error',
      });
      return;
    }

    try {
      const did = `did:ethr:${account}`;

      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            sameAs: 'https://www.w3.org/TR/owl-ref/#sameAs-def',
            wallet: 'https://tzprofiles.com/ethereumWallet',
            EthereumControl: 'https://tzprofiles.com/EthereumControl',
          },
        ],
        id: 'urn:uuid:' + uuid(),
        issuer: did,
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'EthereumControl'],
        credentialSubject: {
          wallet: account,
          sameAs: $userData.account.address,
        },
      };

      const proofOptions = {
        verificationMethod: did + '#Eip712Method2021',
        proofPurpose: 'assertionMethod',
      };

      const keyType = { kty: 'EC', crv: 'secp256k1', alg: 'ES256K-R' };
      const credStr = JSON.stringify(credential);

      const prepStr = await prepareIssueCredential(
        credStr,
        JSON.stringify(proofOptions),
        JSON.stringify(keyType)
      );

      const preparation = JSON.parse(prepStr);

      const typedData = preparation.signingInput;
      if (!typedData || !typedData.primaryType) {
        console.error('proof preparation:', preparation);
        throw new Error('Expected EIP-712 TypedData');
      }

      const signature = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify(typedData)],
      });

      return await completeIssueCredential(credStr, prepStr, signature);
    } catch (err) {
      alert.set({
        message: `Failed to create ethereum claim: ${err?.message || err}`,
        variant: 'error',
      });
    }
  };
</script>

<BasePage class="flex-col flex-wrap items-center justify-center">
  {#if complete}
    <div class="flex">
      Attested that {$userData.account.address} is the same as {account}
    </div>
    <PrimaryButton
      text="Return to Profile"
      class="mt-8"
      onClick={() => navigate('/')}
    />
  {:else}
    {#if !loaded}
      <p>Loading...</p>
    {/if}
    {#if eth}
      {#if accounts?.length}
        <div class="flex">Pick wallet to issue ownership credential with:</div>
        <div class="flex">
          <Select
            name="ethereum"
            id="ethereum"
            bind:value={account}
            onChange={() => {}}
          >
            <Option value="" text="Select an Ethereum wallet" selected />
            {#each accounts as acct, i}
              <Option value={acct} text={acct} />
            {/each}
          </Select>
        </div>
        <PrimaryButton
          text="Add this wallet as a Claim"
          class="mt-8"
          onClick={issue}
        />
      {:else}
        <p>
          No ethereum accounts detected, please configure Metamask with at least
          1 ethereum wallet
        </p>
      {/if}
    {:else}
      <p>
        No Metamask extension detected, please install and configure <a
          href="https://metamask.io/">Metamask</a
        >.
      </p>
    {/if}
  {/if}
</BasePage>
