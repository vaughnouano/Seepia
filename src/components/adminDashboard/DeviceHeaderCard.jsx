import Styles from "./DeviceHeaderCard.module.css";
import SelectorButton from "../ui/button/SelectorButton/SelectorButton";
import { cameras } from "../../lib/camera";

export default function DeviceHeaderCard({
  pendingCount,
  activeTab,
  onTabChange,
  activeCameraSlug,
  onCameraChange,
}) {
  return (
    <div className={Styles.background}>
      <div className={Styles.container}>
        <div className={Styles.item}>
          <p className={Styles.pendingText}>Pending: {pendingCount}</p>
        </div>
        <div className={Styles.item}>
          <SelectorButton
            textContent="pending"
            fill={true}
            buttonState={activeTab === "pending" ? "active" : "inactive"}
            onClick={() => onTabChange("pending")}
          />
          <SelectorButton
            textContent="approved"
            fill={true}
            buttonState={activeTab === "approved" ? "active" : "inactive"}
            onClick={() => onTabChange("approved")}
          />
        </div>
        <div className={Styles.item}>
          <div className={Styles.selectorButtonContainer}>
            <div className={Styles.selectorButtons}>
              {cameras.map((camera) => (
                <SelectorButton
                  key={camera.slug}
                  textContent={camera.name}
                  fill={true}
                  buttonState={
                    activeCameraSlug === camera.slug ? "active" : "inactive"
                  }
                  onClick={() => onCameraChange(camera.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
