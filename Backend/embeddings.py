import os
import warnings
from threading import Lock
from typing import Optional, List
import numpy as np
from dotenv import load_dotenv

# Suppress deprecation/grpc warnings
warnings.filterwarnings("ignore", category=FutureWarning)

load_dotenv()

# Embedding configuration
GEMINI_MODELS_TO_TRY = ["gemini-embedding-001", "gemini-embedding-2", "text-embedding-004"]
LOCAL_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_local_model = None
_model_lock = Lock()


def _get_gemini_api_key() -> Optional[str]:
    """Retrieve Gemini API key from environment."""
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if key and key.strip() and not key.startswith("your_"):
        return key.strip()
    return None


def initialize_embedding_model():
    """Load the local SentenceTransformer embedding model fallback."""
    global _local_model

    if _local_model is None:
        with _model_lock:
            if _local_model is None:
                from sentence_transformers import SentenceTransformer
                _local_model = SentenceTransformer(LOCAL_MODEL_NAME)

    return _local_model


def _normalize(vec: List[float]) -> List[float]:
    """Normalize embedding vector to unit length for accurate cosine similarity."""
    arr = np.array(vec, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm > 0:
        arr = arr / norm
    return arr.tolist()


def _create_gemini_embedding(text: str, api_key: str) -> List[float]:
    """Generate embedding using Google Gemini API."""
    from google import genai
    client = genai.Client(api_key=api_key)

    last_err = None
    for model_name in GEMINI_MODELS_TO_TRY:
        try:
            response = client.models.embed_content(
                model=model_name,
                contents=text,
            )
            if response and response.embeddings and len(response.embeddings) > 0:
                raw_vec = response.embeddings[0].values
                return _normalize(raw_vec)
        except Exception as e:
            last_err = e
            continue

    if last_err:
        raise last_err
    raise RuntimeError("Failed to generate embedding with Gemini API.")


def create_embedding(text: str) -> List[float]:
    """
    Create a normalized embedding for a job description or resume document.
    Uses Google Gemini online embedding if GEMINI_API_KEY is configured,
    otherwise falls back automatically to local SentenceTransformer.
    """
    if not text or not text.strip():
        raise ValueError("Cannot create an embedding from empty text.")

    cleaned_text = text.strip()

    # 1. Try Google Gemini if API Key is available
    api_key = _get_gemini_api_key()
    if api_key:
        try:
            return _create_gemini_embedding(cleaned_text, api_key)
        except Exception as exc:
            print(f"[Embeddings] Gemini API Notice: {exc}. Falling back to local SentenceTransformer.")

    # 2. Local Fallback
    try:
        model = initialize_embedding_model()
        embedding = model.encode(
            cleaned_text,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return embedding.tolist()
    except Exception as exc:
        raise RuntimeError(
            f"Local embedding generation failed. Ensure '{LOCAL_MODEL_NAME}' is available."
        ) from exc
