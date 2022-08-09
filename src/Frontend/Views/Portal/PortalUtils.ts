import { EthAddress } from "@dfdao/types";
import styled from "styled-components";

export function truncateAddress(address: EthAddress) {
  return address.substring(0, 6) + "..." + address.substring(36, 42);
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;
}

export const MinimalButton = styled.button`
  border-radius: 3px;
  padding: 8px;
  background: #252525;
  color: #fff;
  text-transform: uppercase;
`;
