"use client";

import { useSequence } from "./useSequence";

/* A customer messages a salon at 22:14. The helper answers from the salon's
   own facts, offers open times, and books one. The owner is asleep. */

const DELAYS = [700, 1400, 1100, 1600, 1200, 1300, 1100, 1500];

export default function ReceptionistDemo({ business = "Studio Thandi" }: { business?: string }) {
  const { ref, step } = useSequence(DELAYS, 3600);
  const at = (n: number) => step >= n;

  return (
    <div ref={ref} className="ks-phone" aria-label={`A WhatsApp chat with ${business}, answered and booked automatically`} role="img">
      <div className="ks-phone-bar">
        <span className="ks-avatar">{business.charAt(0)}</span>
        <span className="ks-phone-who">
          <b>{business}</b>
          <small>{at(2) && !at(3) ? "typing…" : at(6) && !at(7) ? "typing…" : "online"}</small>
        </span>
        <span className="ks-clock">22:14</span>
      </div>
      <div className="ks-chat">
        <p className="ks-msg ks-msg--in" data-on={at(1)}>
          Hi! Do you have anything on Saturday for a cut and colour?
        </p>
        <p className="ks-msg ks-msg--out" data-on={at(3)}>
          Hi! Yes. A cut and colour is R650 and takes 2 hours. Saturday is open at:
        </p>
        <div className="ks-slots" data-on={at(4)}>
          <span>09:00</span>
          <span data-pick={at(6)}>11:30</span>
          <span>14:00</span>
        </div>
        <p className="ks-msg ks-msg--in" data-on={at(5)}>
          11:30 please
        </p>
        <p className="ks-msg ks-msg--out" data-on={at(7)}>
          Done ✓ Saturday 11:30 with Thandi. We&apos;ll remind you on Friday.
        </p>
      </div>
      <div className="ks-toast" data-on={at(8)}>
        <span className="k-dot" /> New booking · while you slept
      </div>
    </div>
  );
}
