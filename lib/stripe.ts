import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;

export const FREE_LIMITS = {
  viral_dna: 2,
};
