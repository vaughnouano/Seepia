"use client";

import Styles from "./page.module.css";
import Image from "next/image";
import { generateId } from "../../../../lib/generateId";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../../components/bookingForm/Input";
import SignaturePad from "../../../../components/bookingForm/SignaturePad";
import SelectorButton from "../../../../components/ui/button/SelectorButton/SelectorButton";
import TextIconButton from "../../../../components/ui/button/TextIconButton/TextIconButton";
import { getCameraBySlug } from "../../../../lib/camera";
import { pricing, calculateTotalPrice } from "../../../../lib/pricing";
import { daysBetween } from "../../../../lib/rangeSelection";
import { supabase } from "../../../../lib/supabaseClient";
import { uploadBookingFiles } from "../../../../lib/uploadHelper";
import UserRoundIcon from "../../../../components/icons/UserRound";
import PaperScrollIcon from "../../../../components/icons/PaperScroll";
import VerticalBanner from "../../../../../public/images/vertical-brand-image.jpg";

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

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export default function BookingPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();

  const [bookingDraft, setBookingDraft] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    contact_no: "",
    email: "",
    fulfillment_type: "delivery",
    delivery_address: "",
    will_pickup_mandaue: false,
    preferred_time: "",
    return_time: "",
    returning_method: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    renting_purpose: "",
    renting_purpose_other: "",
    allow_social_share: "",
  });

  const age = calculateAge(formData.date_of_birth);

  const [files, setFiles] = useState({
    id_photo: null,
    selfie_with_id: null,
  });

  const [signatureDataUrl, setSignatureDataUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("bookingDraft");
    if (stored) setBookingDraft(JSON.parse(stored));

    const agreed = sessionStorage.getItem("termsAgreed") === "true";
    setTermsAgreed(agreed);

    const savedFormData = sessionStorage.getItem("bookingFormData");
    if (savedFormData) setFormData(JSON.parse(savedFormData));
  }, []);

  useEffect(() => {
    sessionStorage.setItem("bookingFormData", JSON.stringify(formData));
  }, [formData]);

  const camera = bookingDraft
    ? getCameraBySlug(bookingDraft.camera_id)
    : getCameraBySlug(slug);

  const numberOfDays = bookingDraft
    ? daysBetween(bookingDraft.start_date, bookingDraft.end_date) + 1
    : 0;
  const pricePerDay = bookingDraft
    ? pricing[bookingDraft.camera_id]?.[bookingDraft.duration_type]
    : 0;
  const totalPrice = bookingDraft
    ? calculateTotalPrice(
        bookingDraft.camera_id,
        bookingDraft.duration_type,
        numberOfDays,
      )
    : 0;

  function handleFieldChange(field, value) {
    if (field === "preferred_time") {
      setFormData((prev) => ({
        ...prev,
        preferred_time: value,
        return_time: value,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  }
  function handleFileChange(field, fileList) {
    const file = fileList?.[0] ?? null;
    setFiles((prev) => ({ ...prev, [field]: file }));
  }

  function handleGoToTerms() {
    router.push(`/terms?returnTo=/booking/${slug}`);
  }

  const socialsFilledCount = [
    formData.facebook_url,
    formData.instagram_url,
    formData.tiktok_url,
  ].filter((value) => value.trim().length > 0).length;

  const hasEnoughSocials = socialsFilledCount >= 2;

  const canSubmit =
    termsAgreed &&
    hasEnoughSocials &&
    formData.full_name.trim() &&
    formData.date_of_birth &&
    formData.contact_no.trim() &&
    formData.email.trim() &&
    formData.returning_method &&
    formData.allow_social_share &&
    files.id_photo &&
    files.selfie_with_id &&
    signatureDataUrl;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || !bookingDraft || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // ---- Server-side-safe validation (never trust client state alone) ----
      const realAge = calculateAge(formData.date_of_birth);
      if (realAge < 18) {
        throw new Error("Renters must be 18 years old and above.");
      }

      const realSocialsCount = [
        formData.facebook_url,
        formData.instagram_url,
        formData.tiktok_url,
      ].filter((value) => value.trim().length > 0).length;
      if (realSocialsCount < 2) {
        throw new Error("At least 2 social links are required.");
      }

      const realNumberOfDays =
        daysBetween(bookingDraft.start_date, bookingDraft.end_date) + 1;
      const realTotalPrice = calculateTotalPrice(
        bookingDraft.camera_id,
        bookingDraft.duration_type,
        realNumberOfDays,
      );

      // ---- Upload the 3 files first — abort before inserting if any fail ----
      const bookingFolder = generateId();
      const { id_photo_url, selfie_with_id_url, signature_url } =
        await uploadBookingFiles(bookingFolder, {
          idPhoto: files.id_photo,
          selfieWithId: files.selfie_with_id,
          signatureDataUrl: signatureDataUrl,
        });

      const termsAgreedAt = sessionStorage.getItem("termsAgreedAt") || null;

      // delete_after = 14 days past the rental's end date
      const deleteAfterDate = new Date(bookingDraft.end_date);
      deleteAfterDate.setDate(deleteAfterDate.getDate() + 14);

      const { error: insertError } = await supabase.from("bookings").insert({
        camera_id: bookingDraft.camera_id,
        duration_type: bookingDraft.duration_type,
        start_date: bookingDraft.start_date,
        end_date: bookingDraft.end_date,
        total_price: realTotalPrice,

        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        age: realAge,
        contact_no: formData.contact_no,
        email: formData.email,

        fulfillment_type: formData.fulfillment_type,
        delivery_address:
          formData.fulfillment_type === "delivery"
            ? formData.delivery_address
            : null,
        will_pickup_mandaue:
          formData.fulfillment_type === "pickup"
            ? formData.will_pickup_mandaue
            : null,

        preferred_time: formData.preferred_time,
        return_time: formData.return_time,
        returning_method: formData.returning_method,

        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
        tiktok_url: formData.tiktok_url || null,

        renting_purpose: formData.renting_purpose || null,
        renting_purpose_other:
          formData.renting_purpose === "other"
            ? formData.renting_purpose_other
            : null,

        allow_social_share: formData.allow_social_share === "yes",

        id_photo_url,
        selfie_with_id_url,
        signature_url,

        terms_agreed: true,
        terms_agreed_at: termsAgreedAt,

        downpayment_status: "pending",
        status: "pending",
        delete_after: deleteAfterDate.toISOString().split("T")[0],
      });

      if (insertError) throw new Error(insertError.message);

      sessionStorage.removeItem("bookingDraft");
      sessionStorage.removeItem("bookingFormData");
      sessionStorage.removeItem("termsAgreed");
      sessionStorage.removeItem("termsAgreedAt");

      router.push("/booking-confirmed");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!camera) {
    return <div>Camera not found.</div>;
  }

  return (
    <div className={Styles.container}>
      <button
        type="button"
        className={Styles.backButton}
        onClick={() => router.push(`/calendar/${slug}`)}
      >
        Back
      </button>

      <div className={Styles.Form}>
        <form className={Styles.formLayout} onSubmit={handleSubmit}>
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
                label="Full Name: *"
                value={formData.full_name}
                onChange={(value) => handleFieldChange("full_name", value)}
                required
              />

              <div className={Styles.fieldRow}>
                <Input
                  type="date"
                  id="date_of_birth"
                  label="Date of Birth: *"
                  value={formData.date_of_birth}
                  onChange={(value) =>
                    handleFieldChange("date_of_birth", value)
                  }
                  required
                />
                <Input
                  type="text"
                  id="age"
                  label="Age *"
                  value={age}
                  onChange={() => {}}
                  placeholder=""
                />
              </div>

              <Input
                type="tel"
                id="contact_no"
                label="Contact no: *"
                value={formData.contact_no}
                onChange={(value) => handleFieldChange("contact_no", value)}
                required
              />

              <Input
                type="email"
                id="email"
                label="Email Address: *"
                value={formData.email}
                onChange={(value) => handleFieldChange("email", value)}
                required
              />

              <div className={Styles.DeliveryDetailsContainer}>
                <div className={Styles.toggleRow}>
                  <SelectorButton
                    textContent="Delivery"
                    buttonState={
                      formData.fulfillment_type === "delivery"
                        ? "active"
                        : "inactive"
                    }
                    fill={true}
                    onClick={() =>
                      handleFieldChange("fulfillment_type", "delivery")
                    }
                  />
                  <SelectorButton
                    textContent="Pickup"
                    buttonState={
                      formData.fulfillment_type === "pickup"
                        ? "active"
                        : "inactive"
                    }
                    fill={true}
                    onClick={() =>
                      handleFieldChange("fulfillment_type", "pickup")
                    }
                  />
                </div>

                {formData.fulfillment_type === "delivery" ? (
                  <>
                    <Input
                      type="text"
                      id="delivery_address"
                      label="Delivery address: *"
                      value={formData.delivery_address}
                      onChange={(value) =>
                        handleFieldChange("delivery_address", value)
                      }
                      required
                    />
                    <p className={Styles.helperText}>
                      should be visible on maxim, angkas, etc.
                    </p>
                  </>
                ) : (
                  <Input
                    type="checkbox"
                    id="will_pickup_mandaue"
                    label="Will you pick it up in Mandaue? *"
                    checked={formData.will_pickup_mandaue}
                    onChange={(value) =>
                      handleFieldChange("will_pickup_mandaue", value)
                    }
                  />
                )}

                <div className={Styles.subPanel}>
                  <Input
                    type="time"
                    id="preferred_time"
                    label={
                      formData.fulfillment_type === "delivery"
                        ? "Preferred Delivery time: *"
                        : "Preferred Pickup time: *"
                    }
                    value={formData.preferred_time}
                    onChange={(value) =>
                      handleFieldChange("preferred_time", value)
                    }
                    required
                  />

                  <Input
                    type="time"
                    id="return_time"
                    label="Return time"
                    value={formData.return_time}
                    onChange={() => {}}
                    disabled
                    required
                  />

                  <p className={Styles.helperText}>
                    Rentals are based on 24 hour period
                    <br />• Late returns incur <strong>100php per hour</strong>
                  </p>

                  <Input
                    type="radio"
                    id="returning_method"
                    label="Returing of Camera: *"
                    value={formData.returning_method}
                    onChange={(value) =>
                      handleFieldChange("returning_method", value)
                    }
                    options={RETURNING_METHODS}
                    required
                  />
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SocialsContainer}>
                <div>
                  <h2 className={Styles.sectionSmallTitle}>Socials</h2>
                  <p className={Styles.helperText}>At least 2 required</p>
                </div>

                <div className={Styles.inputContainer}>
                  <Input
                    type="url"
                    id="facebook_url"
                    label="Facebook"
                    value={formData.facebook_url}
                    onChange={(value) =>
                      handleFieldChange("facebook_url", value)
                    }
                  />

                  <Input
                    type="url"
                    id="instagram_url"
                    label="Instagram"
                    value={formData.instagram_url}
                    onChange={(value) =>
                      handleFieldChange("instagram_url", value)
                    }
                  />

                  <Input
                    type="url"
                    id="tiktok_url"
                    label="Tiktok"
                    value={formData.tiktok_url}
                    onChange={(value) => handleFieldChange("tiktok_url", value)}
                  />

                  {!hasEnoughSocials && (
                    <p className={Styles.warningText}>
                      Please fill in at least 2 of the 3 links above.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.RentingPurposeContainer}>
                <h2 className={Styles.sectionSmallTitle}>I'm renting for:</h2>
                <div className={Styles.inputContainer}>
                  <Input
                    type="radio"
                    id="renting_purpose"
                    value={formData.renting_purpose}
                    onChange={(value) =>
                      handleFieldChange("renting_purpose", value)
                    }
                    options={[
                      ...RENTING_PURPOSES,
                      { value: "other", label: "Other Special Occasions:" },
                    ]}
                  />

                  {formData.renting_purpose === "other" && (
                    <Input
                      type="text"
                      id="renting_purpose_other"
                      value={formData.renting_purpose_other}
                      onChange={(value) =>
                        handleFieldChange("renting_purpose_other", value)
                      }
                    />
                  )}
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SharePhotosContainer}>
                <div>
                  <h2 className={Styles.sectionSmallTitle}>For our IG</h2>
                  <p className={Styles.helperText}>
                    Would you allow us to share your photos/videos on our page
                    and social media?
                  </p>
                </div>

                <div className={Styles.inputContainer}>
                  <Input
                    type="radio"
                    id="allow_social_share"
                    value={formData.allow_social_share}
                    onChange={(value) =>
                      handleFieldChange("allow_social_share", value)
                    }
                    options={[
                      { value: "yes", label: "Yes, you may share them" },
                      {
                        value: "no",
                        label: "No, I prefer to keep them private",
                      },
                    ]}
                    required
                  />

                  {formData.allow_social_share === "yes" && (
                    <p className={Styles.helperText}>
                      Please leave the photos/videos that you want us to share
                      on the camera upon return. We'll save them ourselves to
                      keep the original quality.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <label className={Styles.termsRow}>
                <Input
                  type="checkbox"
                  id="terms_agreed"
                  label="I have read and agree to Seepia Rentals' Terms & Conditions."
                  checked={termsAgreed}
                  onChange={() => {}}
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoToTerms();
                  }}
                />
              </label>
              <div className={Styles.uploadContainer}>
                <div>
                  <h2 className={Styles.sectionMediumTitle}>
                    Selfie with Valid ID
                  </h2>
                  <p className={Styles.helperText}>
                    Must be (such as National ID, Passport, Driver's License).
                    Use parents' ID if none
                  </p>
                </div>

                <div className={Styles.inputContainer}>
                  <div className={Styles.uploadRow}>
                    <Input
                      type="file"
                      id="id_photo"
                      label="ID only"
                      accept="image/*"
                      onChange={(fileList) =>
                        handleFileChange("id_photo", fileList)
                      }
                      required
                    />
                    <Input
                      type="file"
                      id="selfie_with_id"
                      label="Selfie with ID"
                      accept="image/*"
                      onChange={(fileList) =>
                        handleFileChange("selfie_with_id", fileList)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={Styles.section}>
              <div className={Styles.SignatureContainer}>
                <h2 className={Styles.sectionMediumTitle}>Signature</h2>
                <SignaturePad onChange={setSignatureDataUrl} />
              </div>
            </section>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className={Styles.rightPanel}>
            <div className={Styles.summaryCard}>
              {bookingDraft && (
                <>
                  <div className={Styles.summaryCardHeader}>
                    <h2 className={Styles.cameraName}>{camera.name}</h2>
                    <p className={Styles.forMonth}>
                      For{" "}
                      <b>
                        {
                          MONTH_NAMES[
                            new Date(bookingDraft.start_date).getMonth()
                          ]
                        }
                      </b>
                    </p>
                  </div>
                  <div className={Styles.dateChips}>
                    {Array.from({ length: numberOfDays }, (_, i) => {
                      const date = new Date(bookingDraft.start_date);
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
                        <b>₱{totalPrice} </b> total
                      </p>{" "}
                      <div className={Styles.priceSmallText}>
                        {" "}
                        ({pricePerDay}/day)
                      </div>
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className={Styles.agreementCard}>
              <h2 className={Styles.agreementTitle}>
                <PaperScrollIcon />
                Agreement &amp; Acknowledgment
              </h2>
              <ul className={Styles.agreementList}>
                <li>
                  I understand that the 50% down payment is non-refundable.
                </li>
                <li>
                  I am responsible for the equipment during the entire rental
                  period.
                </li>
                <li>
                  I will return the equipment in the same condition with all
                  accessories included.
                </li>
                <li>
                  If the camera or any accessories are lost, damaged, or beyond
                  repair, I agree to replace it with a brand new one of the same
                  model.
                </li>
              </ul>
            </div>

            <div className={Styles.decorativeImage}>
              {/* <Image
                src={VerticalBanner}
                width={384}
                height={1542}
                alt="vertical decorative image banner"
              /> */}
            </div>

            <div className={Styles.buttonContainer}>
              <TextIconButton
                textContent={isSubmitting ? "Submitting..." : "Submit Form"}
                buttonState={canSubmit && !isSubmitting ? "active" : "disabled"}
                fill={true}
                type="submit"
                disabled={!canSubmit || isSubmitting}
              />

              {submitError && (
                <p role="alert" className={Styles.warningText}>
                  {submitError}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
