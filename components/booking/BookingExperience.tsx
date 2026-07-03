"use client";

import { useState } from "react";
import { ClipboardList, Loader2, Mail, MapPin, Phone, User } from "lucide-react";
import { FormField } from "@/components/booking/FormField";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { SuccessScreen } from "@/components/booking/SuccessScreen";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  projectTitle: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  projectTitle: "",
};

type SuccessData = { clientName: string; dateLabel: string; timeLabel: string };

export function BookingExperience() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  const isComplete =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    form.address.trim() &&
    form.projectTitle.trim() &&
    selectedDate &&
    selectedTime;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess({
        clientName: data.clientName,
        dateLabel: data.dateLabel,
        timeLabel: data.timeLabel,
      });
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative z-10 mx-auto -mt-8 max-w-[1200px] px-4 md:-mt-12 md:px-6">
      <div className="rounded-[24px] bg-white p-6 shadow-2xl shadow-navy/10 md:p-12">
        {success ? (
          <SuccessScreen {...success} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-10 md:grid-cols-2 md:gap-14">
              {/* Left column — client details */}
              <div>
                <h2 className="font-heading text-2xl text-navy">
                  Schedule Your Consultation
                </h2>
                <div className="mt-2 h-px w-14 bg-gold" />
                <p className="mt-4 text-sm text-ink/60">
                  Fill out your details and choose a date and time that works
                  for you. We look forward to connecting!
                </p>

                <div className="mt-6 space-y-5">
                  <FormField
                    label="Name"
                    icon={User}
                    placeholder="Enter your full name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <FormField
                    label="Phone Number"
                    icon={Phone}
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                  <FormField
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <FormField
                    label="Address"
                    icon={MapPin}
                    placeholder="Enter your project address"
                    required
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                  <FormField
                    label="Project Title"
                    icon={ClipboardList}
                    placeholder="Enter your project title"
                    required
                    value={form.projectTitle}
                    onChange={(e) => update("projectTitle", e.target.value)}
                  />
                </div>
              </div>

              {/* Right column — date & time */}
              <div>
                <h2 className="font-heading text-2xl text-navy">
                  Select Date &amp; Time
                </h2>
                <div className="mt-2 h-px w-14 bg-gold" />
                <p className="mt-4 text-sm text-ink/60">
                  Choose a convenient date and time for our meeting.
                </p>

                <div className="mt-6 rounded-2xl border border-soft-gray p-5">
                  <BookingCalendar
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                  />
                  <TimeSlotPicker
                    date={selectedDate}
                    selectedTime={selectedTime}
                    onSelectTime={setSelectedTime}
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={!isComplete || submitting}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-navy to-gold py-4 text-sm font-semibold tracking-widest text-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              SCHEDULE MY CONSULTATION
            </button>

            <p className="mt-4 text-center text-xs text-ink/40">
              Your information is secure and will never be shared.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
