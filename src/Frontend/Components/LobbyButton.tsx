import styled from "styled-components";

export const LobbyButton = styled.button<{ primary?: boolean }>`
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: ${({ primary }) =>
    primary ? "2px solid #2EE7BA" : "1px solid #5F5F5F"};
  color: ${({ primary }) => (primary ? "#2EE7BA" : "#fff")};
  background: ${({ primary }) => (primary ? "#09352B" : "#252525")};
  padding: 16px;
  border-radius: 4px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 80ms ease 0s, border-color;
  &:hover {
    background: ${({ primary }) => (primary ? "#0E5141" : "#3D3D3D")};
    border-color: ${({ primary }) => (primary ? "#30FFCD" : "#797979")};
  }
`;
