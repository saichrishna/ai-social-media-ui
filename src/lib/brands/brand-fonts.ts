import {
  Cormorant_Garamond,
  DM_Sans,
  Manrope,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Sora,
} from "next/font/google";

import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

/** All brand preset font CSS variables (apply once on brand scope wrapper). */
export const brandFontVariableClasses = cn(
  playfair.variable,
  plusJakarta.variable,
  manrope.variable,
  spaceGrotesk.variable,
  dmSans.variable,
  nunitoSans.variable,
  cormorant.variable,
  sora.variable,
  outfit.variable,
);
