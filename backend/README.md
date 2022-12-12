# README

## Quickstart

1. Create environment
```bash
conda create -n occrp-api python=3.10 -y
conda activate occrp-api
```
2. Install the requirements
```bash
cd backend
pip install -r requirements.txt
```

3. Install the occrp document classifier package

In a different folder, clone the repo of doc classifier or pull the latest version:
```bash
git clone git@git.opendfki.de:dssgxdfki/dssgxdfki2022-occrp.git
cd dssgxdfki2022-occrp
# or "git pull" if it's already cloned
```

Follow all the instructions in the README.md contained in the root folder of the repo to set the config file and unpack the models. Afther that, install the package in the environment created previously.
```
conda activate occrp-api
python setup.py install



```
4.  Return to the API repo and run the API
```
uvicorn api:app --reload
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
