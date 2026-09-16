"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Styles from "./page.module.css";

import Input from "../../../../../components/bookingForm/Input";
import SelectorButton from "../../../../../components/ui/button/SelectorButton/SelectorButton";
import TextIconButton from "../../../../../components/ui/button/TextIconButton/TextIconButton";
import { supabase } from "../../../../../lib/supabaseClient";
import { getSignedUrl } from "../../../../../lib/adminActions";
import { getCameraBySlug } from "../../../../../lib/camera";
import { pricing } from "../../../../../lib/pricing";
import { daysBetween } from "../../../../../lib/rangeSelection";
import UserRoundIcon from "../../../../../components/icons/UserRound";
import PaperScrollIcon from "../../../../../components/icons/PaperScroll";

const RETURNING_METHODS = [
  { value: "maxim_angkas", label: "Deliver to Seepia via maxim or angkas" },
  {
    value: "personal_casuntingan",
    label: "Personally deliver it in Casuntingan mandaue",
  },
];

const RENTING_PURPOSES = [
  { value: "birthday", label: "Birthday" },
  { value: "travel", label: "Travel" },
  { value: "night_out", label: "Night Out" },
  { value: "other", label: "Other Special Occasions:" },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ReviewPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [images, setImages] = useState({
    idPhoto: null,
    selfie: null,
    signature: null,
  });
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(null);

  useEffect(() => {
    async function loadBooking() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setLoadError(error.message);
        setIsLoading(false);
        return;
      }

      setBooking(data);

      const [idPhoto, selfie, signature] = await Promise.all([
        getSignedUrl(data.id_photo_url),
        getSignedUrl(data.selfie_with_id_url),
        getSignedUrl(data.signature_url),
      ]);
      setImages({ idPhoto, selfie, signature });
      setIsLoading(false);
    }

    loadBooking();
  }, [id]);

  async function handleApprove() {
    setIsApproving(true);
    setApproveError(null);

    const { error } = await supabase
      .from("bookings")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      setApproveError(error.message);
      setIsApproving(false);
      return;
    }

    router.push("/dashboard");
  }

  if (isLoading) return <div className={Styles.container}>Loading…</div>;
  if (loadError)
    return <div className={Styles.container}>Error: {loadError}</div>;
  if (!booking)
    return <div className={Styles.container}>Booking not found.</div>;

  const camera = getCameraBySlug(booking.camera_id);
  const numberOfDays = daysBetween(booking.start_date, booking.end_date) + 1;
  const pricePerDay = pricing[booking.camera_id]?.[booking.duration_type];

  return (
    <div className={Styles.container}>
      <button
        type="button"
        className={Styles.backButton}
        onClick={() => router.push("/dashboard")}
      >
        Back
      </button>

      <div className={Styles.Form}>
        <div className={Styles.formLayout}>
          {/* ================= LEFT PANEL ================= */}
          <div className={Styles.leftPanel}>
            <section className={Styles.section}>
              <h1 className={Styles.sectionTitle}>
                <UserRoundIcon />
                Renter Information
              </h1>

              <Input
                type="text"
                id="full_name"
                label="Full Name:"
                value={booking.full_name}
                onChange={() => {}}
                disabled
              />

              <div className={Styles.fieldRow}>
                <Input
                  type="date"
                  id="date_of_birth"
                  label="Date of Birth:"
                  value={booking.date_of_birth}
                  onChange={() => {}}
                  disabled
                />
                <Input
                  type="text"
                  id="age"
                  label="Age"
                  value={booking.age}
                  onChange={() => {}}
                  disabled
                />
              </div>

              <Input
                type="tel"
                id="contact_no"
                label="Contact no:"
                value={booking.contact_no}
                onChange={() => {}}
                disabled
              />
              <Input
                type="email"
                id="email"
                label="Email Address:"
                value={booking.email}
                onChange={() => {}}
                disabled
              />

              <div className={Styles.DeliveryDetailsContainer}>
                <div className={Styles.toggleRow}>
                  <SelectorButton
                    textContent="Delivery"
                    fill={true}
                    buttonState={
                      booking.fulfillment_type === "delivery"
                        ? "active"
                        : "inactive"
                    }
                  />
                  <SelectorButton
                    textContent="Pickup"
                    fill={true}
                    buttonState={
                      booking.fulfillment_type === "pickup"
                        ? "active"
                        : "inactive"
                    }
                  />
                </div>

                {booking.fulfillment_type === "delivery" ? (
                  <Input
                    type="text"
                    id="delivery_address"
                    label="Delivery address:"
                    value={booking.delivery_address ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                ) : (
                  <Input
                    type="checkbox"
                    id="will_pickup_mandaue"
                    label="Will pick up in Mandaue"
                    checked={!!booking.will_pickup_mandaue}
                    onChange={() => {}}
                    disabled
                  />
                )}

                <div className={Styles.subPanel}>
                  <Input
                    type="time"
                    id="preferred_time"
                    label="Preferred time:"
                    value={booking.preferred_time}
                    onChange={() => {}}
                    disabled
                  />
                  <Input
                    type="time"
                    id="return_time"
                    label="Return time"
                    value={booking.return_time}
                    onChange={() => {}}
                    disabled
                  />
                  <Input
                    type="radio"
                    id="returning_method"
                    label="Returning of Camera:"
                    value={booking.returning_method}
                    onChange={() => {}}
                    options={RETURNING_METHODS}
                    disabled
                  />
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SocialsContainer}>
                <h2 className={Styles.sectionSmallTitle}>Socials</h2>
                <div className={Styles.inputContainer}>
                  <Input
                    type="url"
                    id="facebook_url"
                    label="Facebook"
                    value={booking.facebook_url ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                  <Input
                    type="url"
                    id="instagram_url"
                    label="Instagram"
                    value={booking.instagram_url ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                  <Input
                    type="url"
                    id="tiktok_url"
                    label="Tiktok"
                    value={booking.tiktok_url ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.RentingPurposeContainer}>
                <h2 className={Styles.sectionSmallTitle}>Renting for:</h2>
                <div className={Styles.inputContainer}>
                  <Input
                    type="radio"
                    id="renting_purpose"
                    value={booking.renting_purpose ?? ""}
                    onChange={() => {}}
                    options={RENTING_PURPOSES}
                    disabled
                  />
                  {booking.renting_purpose === "other" && (
                    <Input
                      type="text"
                      id="renting_purpose_other"
                      value={booking.renting_purpose_other ?? ""}
                      onChange={() => {}}
                      disabled
                    />
                  )}
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SharePhotosContainer}>
                <h2 className={Styles.sectionSmallTitle}>For our IG</h2>
                <Input
                  type="radio"
                  id="allow_social_share"
                  value={booking.allow_social_share ? "yes" : "no"}
                  onChange={() => {}}
                  options={[
                    { value: "yes", label: "Yes, may share" },
                    { value: "no", label: "No, keep private" },
                  ]}
                  disabled
                />
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.uploadContainer}>
                <h2 className={Styles.sectionMediumTitle}>
                  Selfie with Valid ID
                </h2>
                <div className={Styles.uploadRow}>
                  {images.idPhoto && (
                    <img
                      src={images.idPhoto}
                      alt="ID"
                      className={Styles.reviewImage}
                    />
                  )}
                  {images.selfie && (
                    <img
                      src={images.selfie}
                      alt="Selfie with ID"
                      className={Styles.reviewImage}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SignatureContainer}>
                <h2 className={Styles.sectionMediumTitle}>Signature</h2>
                {images.signature && (
                  <img
                    src={images.signature}
                    alt="Signature"
                    className={Styles.reviewImage}
                  />
                )}
              </div>
            </section>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className={Styles.rightPanel}>
            <div className={Styles.summaryCard}>
              <div className={Styles.summaryCardHeader}>
                <h2 className={Styles.cameraName}>{camera?.name}</h2>
                <p className={Styles.forMonth}>
                  For{" "}
                  <b>{MONTH_NAMES[new Date(booking.start_date).getMonth()]}</b>
                </p>
              </div>
              <div className={Styles.dateChips}>
                {Array.from({ length: numberOfDays }, (_, i) => {
                  const date = new Date(booking.start_date);
                  date.setDate(date.getDate() + i);
                  return (
                    <span key={i} className={Styles.dateChip}>
                      {date.getDate()}
                    </span>
                  );
                })}
              </div>
              <div className={Styles.priceBox}>
                <span className={Styles.priceBoxTitle}>Price</span>
                <span>
                  <p>
                    <b>₱{booking.total_price}</b> total
                  </p>
                  <div className={Styles.priceSmallText}>
                    ({pricePerDay}/day)
                  </div>
                </span>
              </div>
            </div>

            <div className={Styles.agreementCard}>
              <h2 className={Styles.agreementTitle}>
                <PaperScrollIcon />
                Agreement &amp; Acknowledgment
              </h2>
              <p>
                Terms agreed: {booking.terms_agreed ? "Yes" : "No"}
                {booking.terms_agreed_at &&
                  ` — ${new Date(booking.terms_agreed_at).toLocaleString()}`}
              </p>
            </div>

            <div className={Styles.buttonContainer}>
              <TextIconButton
                textContent={isApproving ? "Approving..." : "Approve"}
                buttonState="active"
                fill={true}
                onClick={handleApprove}
                disabled={isApproving || booking.status === "approved"}
              />
              {approveError && <p role="alert">{approveError}</p>}
              {booking.status === "approved" && <p>Already approved.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
