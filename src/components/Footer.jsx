// src/components/Footer.jsx
import DonationButton from "./DonationButton";

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Built with plant-based nutrition in mind 🌱  
        Today is a great day to start!
      </p>

      <p>
        <strong>Free. Open Source.</strong> No paywalls, no subscriptions,
        no “Pro” modes — just a simple tool that runs on plants.
      </p>

      {/* <DonationButton compact /> */}
    </footer>
  );
}
