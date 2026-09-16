"use client";

import { useRouter } from "next/navigation";
import Styles from "./canonG7xMarkiiiCard.module.css";

import TextIconButton from "../ui/button/TextIconButton/TextIconButton";
import Tag from "../ui/tags/Tag";

import CanonG7XMarkIII from "../../../public/equipment-mock/canon_g7x_top.png";
import Image from "next/image";

export default function canonG7xMarkiiiCard() {
  const router = useRouter();

  return (
    <div className={Styles.backgroundContainer}>
      <div className={Styles.container}>
        {/* =============== IMAGE-PANEL =============== */}

        <Image
          src={CanonG7XMarkIII}
          alt="Canon G7X Mark III"
          className={Styles.CanonG7XMarkIII}
          layout="responsive"
        />

        {/* =============== DETAILS-PANEL =============== */}
        <div className={Styles.details}>
          <div>
            <div className={Styles.tags}>
              <Tag colorShade="light">Personal Favorite</Tag>
            </div>
            <div className={Styles.header}>
              <h1 className={Styles.title}>G7X - Mark III</h1>
            </div>
            <div className={Styles.description}>
              <p className={Styles.textDescription}>
                Its compact, premium design makes it perfect for Instagram,
                TikTok, travel, lifestyle content, and timeless memories.
              </p>
            </div>
          </div>

          <div className={Styles.buttonContainer}>
            <TextIconButton
              textContent={"BOOK"}
              buttonState={"active"}
              fill={false}
              onClick={() => router.push("/calendar/g7x-mark-iii")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
