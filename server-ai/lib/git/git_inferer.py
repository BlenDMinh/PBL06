from lib.git.generativeimage2text.inference import get_image_transform
from lib.git.generativeimage2text.model import get_git_model
from lib.git.generativeimage2text.common import load_from_yaml_file, init_logging
from lib.git.generativeimage2text.process_image import load_image_by_pil
from lib.git.generativeimage2text.torch_common import load_state_dict

from azfuse import File
from transformers import BertTokenizer
from PIL import Image
import torch
import logging
import os
from env import config

logger = logging.getLogger(__name__)

def parse_dotenv():
    return {
      'model_name': config.get('GIT_MODEL_NAME', 'GIT_LARGE_R_COCO'),
      'model_path': config.get('GIT_MODEL_PATH', 'lib/git/output/GIT_LARGE_R_COCO/snapshot/model.pth'),
      'param_path': config.get('GIT_PARAM_PATH', 'lib/git/aux_data/models/GIT_LARGE_R_COCO/parameter.yaml'),
    }

config = parse_dotenv()
print(config)
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', do_lower_case=True)
param = {}
if File.isfile(config['param_path']):
    param = load_from_yaml_file(config['param_path'])

def prepare_model():    
    model = get_git_model(tokenizer, param)
    pretrained = config['model_path']
    checkpoint = torch.load(pretrained)
    model.textual.load_state_dict(checkpoint["model"])
    model.cuda()
    model.eval()

    return model

model = prepare_model()

def infer(image_path, prefix=''):
    if isinstance(image_path, str):
        image_path = [image_path]

    img = [load_image_by_pil(i) for i in image_path]
    return infer_pil(img, prefix)

def infer_pil(img, prefix='', max_text_len=1024):
    if isinstance(img, Image.Image):
        img = [img]
    transforms = get_image_transform(param)
    img = [transforms(i) for i in img]

    img = [i.unsqueeze(0).cuda() for i in img]

    prefix_encoding = tokenizer(prefix,
                                padding='do_not_pad',
                                truncation=True,
                                add_special_tokens=False,
                                max_length=max_text_len)
    payload = prefix_encoding['input_ids']
    if len(payload) > max_text_len - 2:
        payload = payload[-(max_text_len - 2):]
    input_ids = [tokenizer.cls_token_id] + payload

    with torch.no_grad():
        result = model({
            'image': img,
            'prefix': torch.tensor(input_ids).unsqueeze(0).cuda(),
        })
    cap = tokenizer.decode(result['predictions'][0].tolist(), skip_special_tokens=True)
    logger.info('output: {}'.format(cap))

    return cap