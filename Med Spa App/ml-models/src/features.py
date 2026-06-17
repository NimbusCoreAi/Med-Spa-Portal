"""Feature extraction from Supabase data. Maps to TS feature extractors in packages/intelligence."""

from datetime import datetime, timedelta
from typing import Any


def extract_appointment_features(appointments: list[dict]) -> list[float]:
    """Extract appointment features. Mirrors appointmentFeatures in TS."""
    total = len(appointments)
    completed = sum(1 for a in appointments if a.get("status") == "completed")
    cancelled = sum(1 for a in appointments if a.get("status") == "cancelled")
    no_shows = sum(1 for a in appointments if a.get("status") == "cancelled" and not a.get("intake_completed"))
    completion_rate = completed / total if total > 0 else 0
    cancel_rate = cancelled / total if total > 0 else 0
    no_show_rate = no_shows / total if total > 0 else 0
    return [total, completed, cancelled, no_shows, completion_rate, cancel_rate, no_show_rate]


def extract_payment_features(payments: list[dict]) -> list[float]:
    """Extract payment features. Mirrors paymentFeatures in TS."""
    total = len(payments)
    completed = sum(1 for p in payments if p.get("status") == "completed")
    failed = sum(1 for p in payments if p.get("status") == "failed")
    total_revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "completed")
    avg_payment = total_revenue / completed if completed > 0 else 0
    return [total, completed, failed, round(total_revenue, 2), round(avg_payment, 2)]


def extract_engagement_features(audit_logs: list[dict]) -> list[float]:
    """Extract engagement features. Mirrors engagementFeatures in TS."""
    login_count = sum(1 for l in audit_logs if l.get("action") == "login")
    login_logs = [l for l in audit_logs if l.get("action") == "login"]
    if login_logs:
        latest = max(l.get("created_at", "") for l in login_logs)
        if latest:
            days_since_login = (datetime.now() - datetime.fromisoformat(latest.replace("Z", "+00:00"))).days
        else:
            days_since_login = -1
    else:
        days_since_login = -1
    return [login_count, days_since_login, len(audit_logs)]


def build_feature_matrix(appointments: list[dict], payments: list[dict], audit_logs: list[dict]) -> list[float]:
    """Build complete feature vector from all extractors."""
    features = []
    features.extend(extract_appointment_features(appointments))
    features.extend(extract_payment_features(payments))
    features.extend(extract_engagement_features(audit_logs))
    return features
