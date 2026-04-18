import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class AccessType(str, enum.Enum):
    qr_scan = "qr_scan"
    direct = "direct"
    api = "api"


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    accessed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    access_type = Column(String(20), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    accessed_at = Column(DateTime(timezone=True), server_default=func.now())
