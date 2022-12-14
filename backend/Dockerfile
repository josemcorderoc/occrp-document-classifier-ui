FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

RUN apt-get install poppler-utils -y

ARG GITLAB_USERNAME
ARG GITLAB_PASSWORD

ENV GITLAB_USERNAME=${GITLAB_USERNAME}
ENV GITLAB_PASSWORD=${GITLAB_PASSWORD}

ENV MODEL_ARCHITECTURE_NAME=EfficientNetB4
ENV BINARY_CLASSIFIER_PATH=/data/EfficientNetB0_binary_final
ENV MULTICLASS_CLASSIFIER_PATH=/data/EfficientNetB0_multiclass_final

COPY data /data
COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY api.py /app/main.py

RUN pip uninstall opencv-python -y && pip install opencv-python-headless
