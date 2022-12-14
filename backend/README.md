# README

## Quickstart

1. Create environment

You can use any enviroment manager (conda, Pipenv, virtualenv, etc..)

```bash
# conda example
conda create -n occrp-api python=3.10 -y
conda activate occrp-api

# pipenv example
pipenv install
pipenv shell
```

2. Install the requirements
```bash
cd backend
pip install -r requirements.txt
```

3. Fill the .env file

The .env file contains three variables: the model architecture to be used, the path to the middlepage binary classifier and the path to the multiclass document classifier. In order to make the model weights accesible to the API, you need to declare their absolute directory:

```bash
MODEL_ARCHITECTURE_NAME=EfficientNetB4
BINARY_CLASSIFIER_PATH="/some/local/path/to/binary/model/EfficientNetB4_binary_final"  # replace this path with a path of your computer containing the model
MULTICLASS_CLASSIFIER_PATH="/some/local/path/to/multiclass/model/EfficientNetB4_multiclass_final" # replace this path with a path of your computer containing the model
```

It is recommended to add the path between quotes. MODEL_ARCHITECTURE_NAME should be consistent with the model type in both paths. A model folder should have this minimal structure:
```
EfficientNetB4_multiclass_final   # example name
├── assessment
├── model_inputs
│   ├── labels.csv
│   └── ...
├── weights
│   ├── best model          
```

4.  Run the API
```
uvicorn api:app --reload --env-file .env
```

Wait until the message "Application startup complete" is displayed, then you can test the API in this url:

[http://127.0.0.1:8000/docs#/default/create_upload_file_predict_post](http://127.0.0.1:8000/docs#/default/create_upload_file_predict_post)


## Troubleshooting

If you receive the error `ModuleNotFoundError: No module named 'pip._vendor.six'`, check if pip3 is available in the environment by `pip3 --version`. If it is not, install it:
```
wget https://bootstrap.pypa.io/get-pip.py
python3 get-pip.py
```
Check if it is working now:
```
pip3 --version
```

If `ERROR:    Error loading ASGI app. Could not import module "api".` Check if you are in the right folder, try:
```
cd backend
```

If on `uvicorn api:app --reload` you get `uvicorn not found, but can be installed with ... `, enter the environment. With pipenv that is:
```
pipenv shell
```
