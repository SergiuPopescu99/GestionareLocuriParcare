import styled from "styled-components";

const Wrapper = styled.section`
  min-height: 100vh;
  display: grid;
  align-items: center;
  .logo {
    display: block;
    margin: 0 auto;
    margin-bottom: 1.38rem;
    background-color: inherit;
  }
  .form {
    max-width: 400px;
    border-top: 5px solid var(--primary-500);
  }
  h4 {
    text-align: center;
    margin-bottom: 1.38rem;
  }
  p {
    margin-top: 1rem;
    text-align: center;
    line-height: 1.5;
  }
  .btn {
    margin-top: 1rem;
  }
  .member-btn {
    color: var(--primary-500);
    letter-spacing: var(--letter-spacing);
    margin-left: 0.25rem;
  }
  .password-input-wrapper {
    position: relative; /* Creează un context de poziționare relativ */
  }

  .password-toggle-button {
    position: absolute; /* Scoate butonul din fluxul normal */
    top: 50%; /* Plasează butonul pe jumătatea înălțimii wrapper-ului input-ului */
    right: 10px; /* Plasează butonul la 10 pixeli distanță de marginea dreaptă a wrapper-ului */
    transform: translateY(
      -50%
    ); /* Ajustează butonul vertical pentru a-l centra */
    background-color: inherit;
    border: none;
    cursor: pointer;
  }
`;
export default Wrapper;
