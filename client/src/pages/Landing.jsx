import styled from "styled-components";
import Wrapper from "../assets/wrappers/LandingPage";
import logo from "../assets/images/logo2.jpg";
import { Link } from "react-router-dom";
import parking from "../assets/images/parking.png";

const Nav = styled.nav`
  width: var(--fluid-width);
  max-width: var(--max-width);
  margin: 0 auto;
  height: auto;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  max-width: 300px;
  max-height: 180px;
`;

const LandingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 2rem;
  margin-top: -2rem;

  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InfoContainer = styled.div`
  padding: 2rem;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ParkingImage = styled.img`
  max-width: 100%;
  height: auto;
`;

const Landing = () => {
  return (
    <Wrapper>
      <Nav>
        <nav></nav>
      </Nav>
      <LandingContainer>
        <InfoContainer>
          <h1>
            Park <span>Tracking</span> App
          </h1>
          <p>
            Sunt veniam DSA beard wayfarers. Cupidatat marfa sunt crucifix quis
            flannel consectetur humblebrag food truck bushwick ennui letterpress
            freegan. Minim skateboard salvia bruh tattooed synth shaman labore
            eu post-ironic af fashion axe kogi la croix. Big mood meh
            consectetur, mlkshk gorpcore same PBR&B williamsburg chambray
            everyday carry. Tattooed in adaptogen, forage consectetur paleo
            glossier small batch PBR&B tote bag +1.
          </p>
          <Link to="/register" className="btn register-link">
            Register
          </Link>
          <Link to="/login" className="btn">
            Login / Demo User
          </Link>
        </InfoContainer>
        <ImageContainer>
          <ParkingImage src={parking} alt="" />
        </ImageContainer>
      </LandingContainer>
    </Wrapper>
  );
};

export default Landing;
