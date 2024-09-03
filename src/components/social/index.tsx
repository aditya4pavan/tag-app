'use client';
import { useEffect } from "react";

export default function SocialFeed() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.curator.io/published/ad36e037-f05c-43b0-bca8-1edda10e417c.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div id="curator-feed-default-feed-layout">
        <a href="https://curator.io" target="_blank" className="crt-logo crt-tag">
          Powered by Curator.io
        </a>
      </div>
    </>
  );
}
