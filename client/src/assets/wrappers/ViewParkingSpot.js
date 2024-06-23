import styled from "styled-components";
import "mapbox-gl/dist/mapbox-gl.css";
const Wrapper = styled.div`
  .wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background: #f4f4f4; /* Light grey background for better text visibility */
  }

  h1 {
    text-align: center;
    color: #333;
  }

  .map-container {
    margin-top: 20px;
    height: 300px;
    width: 100%;
  }

  .details-section {
    margin-top: 20px;
    background: #e0e0e0; /* Slightly darker shade for contrast */
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #333; /* Ensuring text is visible on lighter backgrounds */
  }

  .park-info {
    display: flex;
    align-items: center;
    font-size: 16px;
  }

  .park-info i {
    margin-right: 10px;
    font-size: 20px;
    color: #4a90e2;
  }

  .spot-image {
    max-width: 100%;
    max-height: 400px; /* Limiting height of the image */
    border-radius: 8px;
    margin-top: 20px;
    object-fit: cover; /* Ensures the image covers the assigned area without distortion */
  }

  @media (max-width: 768px) {
    .details-section {
      flex-direction: column;
    }

    .map-container {
      height: 200px;
    }
  }
`;
export default Wrapper;
