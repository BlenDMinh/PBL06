#!/bin/bash

pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# If the model is not already downloaded, download it
if [ ! -f "${GIT_MODEL_PATH}" ]; then
    mkdir -p "output/${GIT_MODEL_NAME}/snapshot"
    wget -O "${GIT_MODEL_PATH}" "https://publicgit.blob.core.windows.net/data/output/${GIT_MODEL_NAME}/snapshot/model.pt"
fi
