import { NextRequest, NextResponse } from "next/server";
import {
  isValidEmail,
  sendEnquiryConfirmation,
  sendEnquiryNotification,
  type Enquiry,
} from "@/lib/email";
import { postSigmafyLead } from "@/lib/sigmafy/lead-client";
import {
  routeEnquiry,
  routingRecordText,
  sigmafySubjectForRoute,
} from "@/lib/enquiry-routing";
import { apiErrorResponse, readProtectedJson } from "@/lib/api-protection";
import { insertEnquiry } from "@/lib/enquiries/store";

const partnershipInterests = new Set([
  "improvement-programme",
  "operational-excellence",
  "transformation-office",
  "outcome-partnership",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await readProtectedJson<Partial<Enquiry> & { honeypot?: string }>(req, {
      endpoint: "contact",
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    // Bots fill hidden fields. Return success so they learn nothing.
    if (String(body.honeypot ?? "").trim()) {
      return NextResponse.json({ ok: true });
    }

    const field = (value: unknown, max = 180) => String(value ?? "").trim().slice(0, max);
    const allowedAttribution = new Set([
      "gclid", "wbraid", "gbraid", "utm_source", "utm_medium",
      "utm_campaign", "utm_content", "utm_term", "first_landing_page", "source_page",
    ]);
    const enquiry: Enquiry = {
      firstName: field(body.firstName, 100),
      lastName: field(body.lastName, 100),
      email: field(body.email, 254).toLowerCase(),
      company: field(body.company, 180),
      phone: field(body.phone, 80),
      website: field(body.website, 500),
      siteRegion: field(body.siteRegion, 180),
      interest: field(body.interest, 80),
      processState: field(body.processState, 80),
      sponsorStatus: field(body.sponsorStatus, 80),
      workstreamCount: field(body.workstreamCount, 80),
      trainingPopulation: field(body.trainingPopulation, 80),
      dataReadiness: field(body.dataReadiness, 80),
      decisionTiming: field(body.decisionTiming, 80),
      consent: field(body.consent, 10),
      message: field(body.message, 4_000),
      attribution:
        body.attribution && typeof body.attribution === "object"
          ? Object.fromEntries(
              Object.entries(body.attribution)
                .filter(([key]) => allowedAttribution.has(key))
                .map(([key, value]) => [key, field(value, 500)]),
            )
          : {},
    };

    if (
      !enquiry.firstName ||
      !enquiry.lastName ||
      !enquiry.email ||
      !enquiry.company ||
      !enquiry.message ||
      enquiry.consent !== "yes"
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!isValidEmail(enquiry.email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (
      partnershipInterests.has(enquiry.interest ?? "") &&
      (!enquiry.sponsorStatus ||
        !enquiry.workstreamCount ||
        !enquiry.trainingPopulation ||
        !enquiry.dataReadiness ||
        !enquiry.decisionTiming)
    ) {
      return NextResponse.json(
        { ok: false, error: "Please complete the partnership qualification questions." },
        { status: 400 },
      );
    }

    const receivedAt = new Date();
    const routing = routeEnquiry(enquiry, receivedAt);
    const sourcePage = enquiry.attribution?.source_page || "/contact";
    const utm = Object.fromEntries(
      Object.entries(enquiry.attribution ?? {}).filter(([key]) => key.startsWith("utm_")),
    );

    const leadRecord = {
      source: "2ko-contact",
      sourcePage,
      externalReference: routing.reference,
      name: `${enquiry.firstName} ${enquiry.lastName}`.trim() || enquiry.email,
      email: enquiry.email,
      phone: enquiry.phone || null,
      company: enquiry.company || null,
      subject: sigmafySubjectForRoute(routing.routeKey),
      routeKey: routing.routeKey,
      routeCode: routing.routeCode,
      routeLabel: routing.routeLabel,
      routeOwner: routing.owner,
      routingConfidence: routing.confidence,
      nextAction: routing.nextAction,
      routingSignals: routing.signals,
      humanReviewRequired: routing.humanReviewRequired,
      nextFollowUpAt: routing.nextActionDueAt,
      message: [
        routingRecordText(routing),
        enquiry.interest ? `Starting point: ${enquiry.interest}` : "",
        enquiry.processState ? `Process state: ${enquiry.processState}` : "",
        enquiry.sponsorStatus ? `Executive sponsorship: ${enquiry.sponsorStatus}` : "",
        enquiry.workstreamCount ? `Active workstreams: ${enquiry.workstreamCount}` : "",
        enquiry.trainingPopulation ? `Training population: ${enquiry.trainingPopulation}` : "",
        enquiry.dataReadiness ? `Baseline and data: ${enquiry.dataReadiness}` : "",
        enquiry.decisionTiming ? `Decision window: ${enquiry.decisionTiming}` : "",
        enquiry.message || "Enquiry via the 2KO contact form",
      ].filter(Boolean).join("\n\n"),
      utm: Object.keys(utm).length ? utm : null,
      userAgent: req.headers.get("user-agent"),
      receivedAt: routing.receivedAt,
    } as const;

    // A lead must reach at least one independent internal channel before the
    // visitor sees success. Sigmafy remains the preferred controlled record;
    // the notification email is the fallback when that service is unavailable.
    const [sigmafyDelivery, internalNotification, recorded] = await Promise.allSettled([
      postSigmafyLead(leadRecord),
      sendEnquiryNotification(enquiry, routing),
      // The estate's own record. Best-effort on purpose: it is a third channel
      // alongside Sigmafy and the notification email, not a new way for a
      // submission to fail. The visitor's success does not depend on it.
      insertEnquiry({
        site: "2ko.co.za",
        kind: "contact",
        sourcePage: leadRecord.sourcePage ?? undefined,
        name: leadRecord.name,
        email: leadRecord.email,
        phone: leadRecord.phone ?? undefined,
        company: leadRecord.company ?? undefined,
        subject: leadRecord.subject,
        message: leadRecord.message,
        utm: leadRecord.utm ?? undefined,
        country: req.headers.get("cf-ipcountry") ?? undefined,
        userAgent: leadRecord.userAgent ?? undefined,
        // The routing decision, kept whole. It is what makes the difference
        // between "an enquiry arrived" and "an enquiry arrived, was classified
        // this way, and is owed a reply by then" — which is what the
        // autoresponder will need.
        extra: {
          reference: leadRecord.externalReference,
          routeKey: leadRecord.routeKey,
          routeLabel: leadRecord.routeLabel,
          owner: leadRecord.routeOwner,
          confidence: leadRecord.routingConfidence,
          nextAction: leadRecord.nextAction,
          nextFollowUpAt: leadRecord.nextFollowUpAt,
          humanReviewRequired: leadRecord.humanReviewRequired,
        },
      }),
    ]);

    if (recorded.status === "rejected") {
      console.error("contact enquiry record failed:", recorded.reason);
    }
    if (sigmafyDelivery.status === "rejected") {
      console.error("contact Sigmafy delivery failed:", sigmafyDelivery.reason);
    }
    if (internalNotification.status === "rejected") {
      console.error("contact internal notification failed:", internalNotification.reason);
    }
    if (sigmafyDelivery.status === "rejected" && internalNotification.status === "rejected") {
      throw new Error("No internal lead-delivery channel succeeded");
    }

    const confirmation = await Promise.allSettled([
      sendEnquiryConfirmation(enquiry, routing),
    ]);
    if (confirmation[0].status === "rejected") {
      console.error("contact confirmation failed:", confirmation[0].reason);
    }

    return NextResponse.json({
      ok: true,
      reference: routing.reference,
      responseTarget: routing.responseTarget,
    });
  } catch (error) {
    const guarded = apiErrorResponse(error);
    if (guarded) return guarded;
    console.error("/api/contact failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not send that. Please try again." },
      { status: 500 },
    );
  }
}
