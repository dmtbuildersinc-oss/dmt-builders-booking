/**
 * DMT Builders — Site Configuration
 *
 * Edit this file to change branding, colors, images, and booking rules.
 * No other code needs to change when you update values here.
 */

export const siteConfig = {
  company: {
    name: "DMT Builders, Inc.",
    tagline: "Design Meets Transformation — Inside & Out",
    owner: "Michael Lungu",
    website: "https://dmtbuildersinc.com",
    digitalBusinessCard:
      "https://dmtbuildersinc.com/michael-lungu-digital-business-card/",
    contactPage: "https://dmtbuildersinc.com/contact-us/",
    // Email address that receives owner-side booking notifications.
    ownerEmail: process.env.OWNER_EMAIL || "info@dmtbuildersinc.com",
  },

  // Replace these with your own files any time — just drop a new image at
  // the same path in /public/images (or point to a different path below).
  images: {
    logo: "/images/logo.png",
    heroBackground: "/images/hero.jpg",
  },

  colors: {
    navy: "#05053D",
    gold: "#B89A63",
    warmWhite: "#F7F7F5",
    gray: "#EAEAEA",
    text: "#1F1F1F",
  },

  fonts: {
    heading: "Playfair Display",
    body: "Inter",
  },

  // ---------------------------------------------------------------------
  // Booking rules — control availability, meeting length, and daily caps.
  // ---------------------------------------------------------------------
  booking: {
    timezone: "America/Los_Angeles",

    // 0 = Sunday ... 6 = Saturday
    workingDays: [1, 2, 3, 4, 5], // Monday–Friday

    workingHours: {
      start: "09:00",
      end: "17:00",
    },

    // Times excluded even within working hours (e.g. lunch break).
    excludedTimes: ["12:00"],

    meetingDurationMinutes: 60,
    bufferMinutesBetweenMeetings: 15,
    maxBookingsPerDay: 6,

    // How many days ahead clients are allowed to book.
    bookingWindowDays: 60,

    // Minimum notice (in hours) required before a booking's start time.
    minNoticeHours: 12,
  },
} as const;

export type SiteConfig = typeof siteConfig;
