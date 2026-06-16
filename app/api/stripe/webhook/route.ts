import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id ?? session.client_reference_id;
    if (!userId) return NextResponse.json({ received: true });

    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

    // Update profile plan + customer id
    await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
      .upsert({ id: userId, plan: "pro", stripe_customer_id: customerId }, { onConflict: "id" });

    // Upsert subscription record
    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const subAny = sub as unknown as Record<string, unknown>;
      await (supabase.from("subscriptions") as ReturnType<typeof supabase.from>)
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: (sub.items.data[0]?.price?.id) ?? null,
          plan: "pro",
          status: sub.status,
          current_period_start: subAny["current_period_start"] ? new Date((subAny["current_period_start"] as number) * 1000).toISOString() : null,
          current_period_end: subAny["current_period_end"] ? new Date((subAny["current_period_end"] as number) * 1000).toISOString() : null,
        }, { onConflict: "stripe_subscription_id" });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    // Find user via subscriptions table
    const { data: sub } = await (supabase.from("subscriptions") as ReturnType<typeof supabase.from>)
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .single() as unknown as { data: { user_id: string } | null };

    if (sub?.user_id) {
      await (supabase.from("profiles") as ReturnType<typeof supabase.from>)
        .update({ plan: "free" })
        .eq("id", sub.user_id);

      await (supabase.from("subscriptions") as ReturnType<typeof supabase.from>)
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscriptionId);
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const subAny = subscription as unknown as Record<string, unknown>;

    await (supabase.from("subscriptions") as ReturnType<typeof supabase.from>)
      .update({
        status: subscription.status,
        current_period_start: subAny["current_period_start"] ? new Date((subAny["current_period_start"] as number) * 1000).toISOString() : null,
        current_period_end: subAny["current_period_end"] ? new Date((subAny["current_period_end"] as number) * 1000).toISOString() : null,
      })
      .eq("stripe_subscription_id", subscription.id);
  }

  return NextResponse.json({ received: true });
}
