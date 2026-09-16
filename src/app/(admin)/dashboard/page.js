"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Styles from "./page.module.css";

import Calendar from "../../../components/calendar/Calendar";
import DeviceHeaderCard from "../../../components/adminDashboard/DeviceHeaderCard";
import SubmissionCard from "../../../components/adminDashboard/SubmissionCard";
import { cameras } from "../../../lib/camera";
import { supabase } from "../../../lib/supabaseClient";
import { deleteBookingCompletely } from "../../../lib/adminActions";
import { getDateRangeArray } from "../../../lib/rangeSelection";

export default function DashboardPage() {
  const router = useRouter();

  const [activeCameraSlug, setActiveCameraSlug] = useState(cameras[0].slug);
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("camera_id", activeCameraSlug)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setBookings([]);
    } else {
      setBookings(data ?? []);
    }
    setIsLoading(false);
  }, [activeCameraSlug]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const dateToBooking = useMemo(() => {
    const map = new Map();
    bookings.forEach((booking) => {
      getDateRangeArray(booking.start_date, booking.end_date).forEach(
        (dateKey) => {
          map.set(dateKey, booking);
        },
      );
    });
    return map;
  }, [bookings]);

  const unavailableDates = useMemo(
    () => new Set(dateToBooking.keys()),
    [dateToBooking],
  );

  const selectedBooking =
    bookings.find((b) => b.id === selectedBookingId) ?? null;

  const selectedDates = selectedBooking
    ? getDateRangeArray(selectedBooking.start_date, selectedBooking.end_date)
    : [];

  const visibleBookings = selectedBooking
    ? [selectedBooking]
    : bookings.filter((b) => b.status === activeTab);

  function handleSelectDate(dateKey) {
    const booking = dateToBooking.get(dateKey);
    if (booking) {
      setSelectedBookingId(booking.id);
      setActiveTab(booking.status);
    } else {
      setSelectedBookingId(null);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSelectedBookingId(null);
  }

  function handleCameraChange(slug) {
    setActiveCameraSlug(slug);
    setSelectedBookingId(null);
  }

  function handleReview(booking) {
    router.push(`/dashboard/review/${booking.id}`);
  }

  async function handleDone(booking) {
    const confirmed = window.confirm(
      `Remove ${booking.full_name}'s booking and all its data? This can't be undone.`,
    );
    if (!confirmed) return;

    const { error } = await deleteBookingCompletely(booking);
    if (error) {
      window.alert(`Couldn't remove this booking: ${error}`);
      return;
    }

    setSelectedBookingId(null);
    fetchBookings();
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.Main}>
        <div className={Styles.leftPanel}>
          <Calendar
            cameraId={activeCameraSlug}
            unavailableDates={unavailableDates}
            selectedDates={selectedDates}
            onSelectDate={handleSelectDate}
            bookedDatesClickable={true}
          />
        </div>
        <div className={Styles.rightPanel}>
          <div className={Styles.deviceHeaderContainer}>
            <DeviceHeaderCard
              pendingCount={pendingCount}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              activeCameraSlug={activeCameraSlug}
              onCameraChange={handleCameraChange}
            />
          </div>
          <div className={Styles.submissionCardList}>
            {loadError && (
              <p role="alert">Couldn't load bookings: {loadError}</p>
            )}
            {!isLoading && visibleBookings.length === 0 && (
              <p>
                No {selectedBooking ? "" : activeTab} submissions right now.
              </p>
            )}
            {visibleBookings.map((booking) => (
              <SubmissionCard
                key={booking.id}
                booking={booking}
                onReview={handleReview}
                onDone={handleDone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
