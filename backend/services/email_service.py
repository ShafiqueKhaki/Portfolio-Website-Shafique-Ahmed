import resend
from config import settings


def send_contact_notification(name: str, email: str, subject: str, message: str) -> bool:
    """Send contact form notification via Resend."""
    if not settings.RESEND_API_KEY or not settings.CONTACT_NOTIFICATION_EMAIL:
        return False

    resend.api_key = settings.RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "Portfolio Contact <onboarding@resend.dev>",
            "to": [settings.CONTACT_NOTIFICATION_EMAIL],
            "reply_to": email,
            "subject": f"[Portfolio Contact] {subject or 'New Message'}",
            "html": f"""
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> {name} &lt;{email}&gt;</p>
            <p><strong>Subject:</strong> {subject}</p>
            <hr>
            <p>{message.replace(chr(10), '<br>')}</p>
            """,
        })
        return True
    except Exception as e:
        print(f"[email_service] Failed to send email: {e}")
        return False
