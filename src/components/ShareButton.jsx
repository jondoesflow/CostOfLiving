import { useState } from "react";
import { Share2 } from "lucide-react";
import { SITE_URL } from "../pages";

// Shares a result with a link back to the tool. Uses the phone's own share
// sheet where there is one, otherwise copies the message to the clipboard.
// The link is tagged (utm_source=share) so shared visits show up in Umami.
export default function ShareButton({ text, path = "/", tool }) {
  const [status, setStatus] = useState("");
  const url = `${SITE_URL}${path}?utm_source=share&utm_medium=result&utm_campaign=${tool}`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Cheap Watts", text, url });
        setStatus("");
        return;
      } catch (e) {
        if (e.name === "AbortError") return; // they closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus("Copied. Paste it into a message or post to share it.");
    } catch {
      setStatus(`Couldn't copy automatically. Share this link: ${url}`);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button" onClick={share} data-umami-event="share-result" data-umami-event-tool={tool}
        className="px-3 py-2 rounded-lg border-2 border-navy text-navy text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-navy/10"
      >
        <Share2 size={16} aria-hidden="true" /> Share this
      </button>
      <p role="status" className="text-sm text-gray-600 mt-2 break-words">{status}</p>
    </div>
  );
}
