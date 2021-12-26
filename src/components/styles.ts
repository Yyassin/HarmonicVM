import styled from "styled-components";

/*** Styles for prisma syntax highlighting (css is not supported conviently) ***/

export const Wrapper = styled.div`
  font-family: sans-serif;
  text-align: center;
`;

export const Pre = styled.pre`
  text-align: left;
  height: 100%;
  margin: 0;
  padding: 0.5em;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: normal

  & .token-line {
    line-height: 1.3em;
    height: 1.3em;
  }
`;

export const Line = styled.div`
  display: table-row;
`;

export const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

export const LineContent = styled.span`
  display: table-cell;
`;
