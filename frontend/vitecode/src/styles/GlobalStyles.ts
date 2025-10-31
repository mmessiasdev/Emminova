import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    background: ${props => props.theme.colors.background.primary};
    color: ${props => props.theme.colors.text.primary};
    line-height: 1.6;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.typography.fontFamily.secondary};
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: ${props => props.theme.spacing.md};
  }

  h1 {
    font-size: ${props => props.theme.typography.sizes.h1};
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h2 {
    font-size: ${props => props.theme.typography.sizes.h2};
  }

  h3 {
    font-size: ${props => props.theme.typography.sizes.h3};
  }

  p {
    font-size: ${props => props.theme.typography.sizes.body};
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: ${props => props.theme.colors.secondary};
    }
  }

  button {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    border: none;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  input, textarea {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    border: none;
    outline: none;
    transition: all 0.3s ease;

    &::placeholder {
      color: ${props => props.theme.colors.text.secondary};
    }
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;