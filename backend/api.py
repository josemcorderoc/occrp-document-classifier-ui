import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile
from prediction.predict import predict_documents
from prediction.predict_probs import predict_documents_probs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# disable CORS for local test purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def create_upload_file(uploaded_file: UploadFile):
    with tempfile.TemporaryDirectory() as tmpdir_path:
        temp_file_copy = os.path.join(tmpdir_path, uploaded_file.filename)
        with open(temp_file_copy, "wb+") as file_object:
            shutil.copyfileobj(uploaded_file.file, file_object)
        return {"prediction": predict_documents_probs([temp_file_copy], "EfficientNetB4")[0]}