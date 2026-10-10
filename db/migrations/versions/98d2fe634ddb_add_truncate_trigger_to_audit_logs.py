"""Add truncate trigger to audit logs

Revision ID: 98d2fe634ddb
Revises: 530859de9d3b
Create Date: 2026-10-10 21:15:31.062755

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98d2fe634ddb'
down_revision: Union[str, Sequence[str], None] = '530859de9d3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
    CREATE OR REPLACE FUNCTION prevent_audit_log_truncate()
    RETURNS TRIGGER AS $$
    BEGIN
        RAISE EXCEPTION 'audit_logs is an append-only table. TRUNCATE is not allowed.';
    END;
    $$ LANGUAGE plpgsql;
    """)
    op.execute("""
    CREATE TRIGGER audit_logs_no_truncate
    BEFORE TRUNCATE ON audit_logs
    FOR EACH STATEMENT
    EXECUTE FUNCTION prevent_audit_log_truncate();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS audit_logs_no_truncate ON audit_logs")
    op.execute("DROP FUNCTION IF EXISTS prevent_audit_log_truncate")
