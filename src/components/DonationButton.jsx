// src/components/DonationButton.jsx
import React from "react";

const STRIPE_DONATION_URL =
  "https://buy.stripe.com/YOUR_CHECKOUT_LINK_HERE";

export default function DonationButton({ compact = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: compact ? "center" : "flex-start",
        gap: "6px",
      }}
    >
      <a
        href={STRIPE_DONATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="donation-button"
      >
        ☕ Support Green Macros
      </a>

      <small
        style={{
          fontSize: "11px",
          opacity: 0.7,
          lineHeight: 1.4,
          maxWidth: "280px",
          textAlign: compact ? "center" : "left",
        }}
      >
        Optional donation. No products or services are provided in exchange.
        <br />
        ※任意の支援であり、対価としての商品・サービスはありません
      </small>
    </div>
  );
}
