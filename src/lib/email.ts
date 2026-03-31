import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ResolvedEmailArgs = {
  to: string;
  issueTitle: string;
  issueId: string;
};

export async function sendIssueResolvedEmail({
  to,
  issueTitle,
  issueId,
}: ResolvedEmailArgs) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;

  const issueUrl = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/issues/${issueId}`
    : `/issues/${issueId}`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [to],
    subject: `Your issue has been resolved: ${issueTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Issue resolved</h2>
        <p>Your issue has been marked as <strong>Resolved</strong>.</p>
        <p><strong>Issue:</strong> ${issueTitle}</p>
        <p><a href="${issueUrl}">View issue details</a></p>
        <p>— IssueDesk</p>
      </div>
    `,
    text: `Your issue has been marked as Resolved.\n\nIssue: ${issueTitle}\nView: ${issueUrl}\n\n— IssueDesk`,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
}