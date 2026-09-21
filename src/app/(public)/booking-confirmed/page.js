"use client";

import { useRouter } from "next/navigation";
import Styles from "./page.module.css";

export default function BookingConfirmedPage() {
  const router = useRouter();

  return (
    <div className={Styles.container}>
      <h1 className={Styles.title}>Your form is now up for approval</h1>
      <p className={Styles.message}>Please wait within 24 hours. Thank you!</p>
      <button
        type="button"
        className={Styles.homeButton}
        onClick={() => router.push("/")}
      >
        Home
      </button>
    </div>
  );
}
