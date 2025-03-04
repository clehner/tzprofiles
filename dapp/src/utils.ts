import { char2Bytes } from '@taquito/utils';
import { RequestSignPayloadInput, SigningType } from '@airgap/beacon-sdk';
import { BeaconWallet } from '@taquito/beacon-wallet';

export const signClaim = async (
  userData,
  fmtInput: string,
  wallet: BeaconWallet
) => {
  const payload: RequestSignPayloadInput = {
    signingType: SigningType.MICHELINE,
    payload: getMichelineStringBytes(fmtInput),
    sourceAddress: userData.account.address,
  };

  let { signature } = await wallet.client.requestSignPayload(payload);
  return signature;
};

export const getMichelineStringBytes = (str: string) => {
  const strLenght = str.length.toString(16).padStart(8, '0');
  const bytes = `0501${strLenght}${char2Bytes(str)}`;
  return bytes;
};
