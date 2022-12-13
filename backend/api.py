import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from occrplib.prediction.predict import load_classifiers
from occrplib.prediction.predict_probs import predict_documents_probs
from occrplib.config import settings

app = FastAPI()

# disable CORS for local test purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# override settings and load models
settings.PREDICTION_MODELS[os.environ["MODEL_ARCHITECTURE_NAME"]] = {
    "binary_classifier": os.environ["BINARY_CLASSIFIER_PATH"],
    "multiclass_classifier": os.environ["MULTICLASS_CLASSIFIER_PATH"]
}
print(settings.PREDICTION_MODELS)
binary_classifier, document_classifier = load_classifiers("EfficientNetB4")

@app.post("/predict")
async def create_upload_file(uploaded_file: UploadFile):
    with tempfile.TemporaryDirectory() as tmpdir_path:
        temp_file_copy = os.path.join(tmpdir_path, uploaded_file.filename)
        with open(temp_file_copy, "wb+") as file_object:
            shutil.copyfileobj(uploaded_file.file, file_object)
        return {"prediction": predict_documents_probs([temp_file_copy], binary_classifier, document_classifier)[0]}
