import io
import json
import os
import urllib.request
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image

MODEL_URL = "https://huggingface.co/BinhQuocNguyen/food-recognition-model/resolve/main/classification_model.h5"
DB_URL = "https://huggingface.co/BinhQuocNguyen/food-recognition-model/raw/main/nutritional_database.json"
CACHE_DIR = Path(os.getenv("CACHE_DIR", "./model_cache"))
MODEL_PATH = CACHE_DIR / "classification_model.h5"
DB_PATH = CACHE_DIR / "nutritional_database.json"
IMAGE_SIZE = (224, 224)
TOP_K = int(os.getenv("TOP_K", "10"))

model = None
class_labels: List[str] = []


def download_if_missing(url: str, dest: Path) -> None:
    if dest.exists():
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"[food-ai] Downloading {dest.name} ...")
    urllib.request.urlretrieve(url, dest)
    print(f"[food-ai] Saved to {dest}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, class_labels

    # Download model files on first run
    download_if_missing(MODEL_URL, MODEL_PATH)
    download_if_missing(DB_URL, DB_PATH)

    # Load class labels (sorted alphabetically = training order for Food-101)
    with open(DB_PATH) as f:
        db: dict = json.load(f)
    class_labels = sorted(db.keys())
    print(f"[food-ai] {len(class_labels)} classes loaded")

    # Load Keras model
    import tensorflow as tf
    model = tf.keras.models.load_model(str(MODEL_PATH))
    print("[food-ai] Model ready.")

    yield
    model = None


app = FastAPI(title="Food AI Service", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok", "ready": model is not None, "classes": len(class_labels)}


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> List[dict]:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    contents = await image.read()
    try:
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB").resize(IMAGE_SIZE)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Preprocess: EfficientNet expects pixels in [-1, 1]
    import tensorflow as tf
    arr = np.array(pil_image, dtype=np.float32)
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)   # (1, 224, 224, 3)

    preds = model.predict(arr, verbose=0)[0]  # shape (num_classes,)

    # Map to labels and sort by score descending
    scored = sorted(
        [{"label": class_labels[i], "score": float(preds[i])} for i in range(len(class_labels))],
        key=lambda x: x["score"],
        reverse=True,
    )
    return scored[:TOP_K]
