import io
import os
import logging
from PIL import Image

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'image/heic', 'image/heif',
    'image/heic-sequence', 'image/heif-sequence',
}
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
MAX_FILE_SIZE = 15 * 1024 * 1024   # 15 MB
MAX_DIMENSION = 8000


def _try_register_heif():
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
        return True
    except ImportError:
        return False


def convert_heic_to_jpeg(file_obj):
    """Convert HEIC/HEIF to JPEG in-memory."""
    _try_register_heif()
    try:
        file_obj.seek(0)
        img = Image.open(file_obj)
        img = img.convert('RGB')
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=90, optimize=True)
        output.seek(0)
        return output, 'converted.jpg', 'image/jpeg'
    except Exception as exc:
        raise ValueError(f"Cannot convert HEIC/HEIF image: {exc}")


def validate_and_process_image(uploaded_file):
    """
    Validate and sanitize an uploaded image file.

    Returns (file_obj, filename, content_type).
    Raises ValueError with a user-friendly message on error.
    """
    # ── Size check ────────────────────────────────────────────────────────────
    if uploaded_file.size > MAX_FILE_SIZE:
        mb = MAX_FILE_SIZE // (1024 * 1024)
        raise ValueError(f"Image too large. Maximum size is {mb} MB.")

    filename = getattr(uploaded_file, 'name', '') or ''
    ext = os.path.splitext(filename)[1].lower()
    content_type = (getattr(uploaded_file, 'content_type', '') or '').lower()

    is_heic = (
        ext in ('.heic', '.heif')
        or 'heic' in content_type
        or 'heif' in content_type
    )

    # ── Extension / MIME check ────────────────────────────────────────────────
    is_allowed = ext in ALLOWED_EXTENSIONS or content_type in ALLOWED_MIME_TYPES

    if not is_allowed:
        # Sniff magic bytes as a fallback (iOS sometimes sends wrong MIME)
        try:
            uploaded_file.seek(0)
            header = uploaded_file.read(16)
            uploaded_file.seek(0)
            if header[:2] == b'\xff\xd8':                        # JPEG
                is_allowed = True
            elif header[:8] == b'\x89PNG\r\n\x1a\n':             # PNG
                is_allowed = True
            elif header[8:12] == b'WEBP':                         # WEBP
                is_allowed = True
            elif b'ftyp' in header:                               # HEIC/HEIF
                is_heic = True
                is_allowed = True
        except Exception:
            pass

    if not is_allowed:
        raise ValueError(
            f"Unsupported image format '{ext or content_type}'. "
            "Supported formats: JPG, JPEG, PNG, WEBP, HEIC/HEIF."
        )

    # ── HEIC conversion ───────────────────────────────────────────────────────
    if is_heic:
        uploaded_file.seek(0)
        return convert_heic_to_jpeg(uploaded_file)

    # ── Validate & strip EXIF ─────────────────────────────────────────────────
    _try_register_heif()
    try:
        uploaded_file.seek(0)
        img = Image.open(uploaded_file)
        img.verify()          # Raises on corrupt files
        uploaded_file.seek(0)
        img = Image.open(uploaded_file)   # Re-open after verify

        # Resize if over dimension limit
        w, h = img.size
        if w > MAX_DIMENSION or h > MAX_DIMENSION:
            ratio = min(MAX_DIMENSION / w, MAX_DIMENSION / h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

        # Pick output format
        fmt_map = {'.jpg': 'JPEG', '.jpeg': 'JPEG', '.png': 'PNG', '.webp': 'WEBP'}
        save_fmt = fmt_map.get(ext, 'JPEG')
        if save_fmt == 'JPEG':
            img = img.convert('RGB')

        output = io.BytesIO()
        img.save(output, format=save_fmt, quality=90, optimize=True)
        output.seek(0)

        new_ext = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp'}.get(save_fmt, '.jpg')
        base = os.path.splitext(filename)[0] if filename else 'image'
        new_filename = base + new_ext
        new_ct = content_type or f'image/{save_fmt.lower()}'
        return output, new_filename, new_ct

    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Invalid or corrupted image: {exc}")
