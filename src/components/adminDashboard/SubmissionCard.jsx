import Styles from "./SubmissionCard.module.css";
import TextButton from "../ui/button/TextButton/TextButton";

function formatSubmittedTime(createdAt) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${period}`;
}

export default function SubmissionCard({ booking, onReview, onDone }) {
  const isApproved = booking.status === "approved";

  return (
    <div className={Styles.background}>
      <div className={Styles.container}>
        <div className={Styles.item}>
          <div className={Styles.textDetails}>
            <p className={Styles.customerName}>{booking.full_name}</p>
            <div className={Styles.timeDetail}>
              Submitted at: {formatSubmittedTime(booking.created_at)}
            </div>
          </div>
          {isApproved ? (
            <TextButton
              textContent="Done"
              fill={false}
              onClick={() => onDone(booking)}
            />
          ) : (
            <TextButton
              textContent="Review"
              fill={false}
              onClick={() => onReview(booking)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
