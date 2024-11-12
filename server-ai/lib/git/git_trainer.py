import logging
import time
import torch
from dataset.dataset import get_train_dataset, get_val_dataset
from generativeimage2text.common import Config
from generativeimage2text.model import get_git_model
from generativeimage2text.train import get_multi_scale_image_transform
from generativeimage2text.data_layer.builder import collate_fn
from generativeimage2text.torch_common import recursive_to_device

# from tqdm import tqdm
from torch.utils.data import DataLoader
from torch import nn
from transformers import BertTokenizer
from PIL import Image

from generativeimage2text.inference import get_image_transform
from generativeimage2text.process_image import load_image_by_pil

BATCH_SIZE = 16
NUM_WORKERS = 0
START_EPOCH = 71
# CHECKPOINT_USE = None
CHECKPOINT_USE = "./output/checkpoint/model_70.pth"
GPU_REST_INTERVAL = 120
GPU_REST_DURATION = 30

cfg = {
    'crop_region_extend_in_datatransform': 4,
    'data_normalize': 'clip',
    'train_crop_size': 224,
    'input_small_scale': 0.8,
    'no_color_jitter': True,
    'no_flip': True,
    'no_aspect_dist': True,
    'interpolation': 'bicubic',
    'min_size_range32': [160, 224], # in pretraining, it is multi-scale from 160 to 224; while for fine-tuning, it is single scale
    'patch_size': 16,
    'train_transform': 'vitp',
}

param = {
    # 'image_encoder_type': 'CLIPViT_L_14',
    # 'visual_feature_size': 1024,
    'num_image_with_embedding': 6,
    'textual_feature_size': 768,
}

device = 'cuda' if torch.cuda.is_available() else 'cpu'

logger = None


def train(model, optimizer, train_loader, val_loader, epoch=91):
    last_rest_time = time.time()
    last = time.time()
    for e in range(START_EPOCH, epoch):
        batch_start = time.time()
        # batch_bar = tqdm(train_loader)
        train_loss = 0
        for id, data in enumerate(train_loader):
            if time.time() - last_rest_time > GPU_REST_INTERVAL:
                last_rest_time = time.time()
                logger.info(f'Resting GPU for {GPU_REST_DURATION}s')
                time.sleep(GPU_REST_DURATION)
            optimizer.zero_grad()
            data = recursive_to_device(data, 'cuda')
            loss_dict = model(data)
            loss = sum(loss_dict.values())
            train_loss += loss.item()
            loss.backward()
            optimizer.step()
            end = time.time()
            # batch_bar.set_description(f'loss: {loss.item()}')
            logger.info(f'Train - Batch ({id + 1}/{len(train_loader)}) - Loss: {loss.item()} - ETA: {(end - last) * len(train_loader):.2f}s - Elapsed: {time.time() - batch_start:.2f}s')
            last = time.time()
        logger.info(f'Train - Epoch {e} - Loss: {train_loss / len(train_loader)}')
        if e % 2 == 0:
            torch.save({
                "model": model.textual.state_dict()
            }, f'./output/checkpoint/model_{e}.pth')
            logger.info(f'Saved checkpoint at epoch {e}')
            # Sample output
            model.eval()
            with torch.no_grad():
                image_path = ['F:/val2017/000000210520.jpg']
                if isinstance(image_path, str):
                    image_path = [image_path]

                img = [load_image_by_pil(i) for i in image_path]
                if isinstance(img, Image.Image):
                    img = [img]
                transforms = get_image_transform(param)
                img = [transforms(i) for i in img]

                img = [i.unsqueeze(0).cuda() for i in img]

                prefix_encoding = tokenizer('',
                                            padding='do_not_pad',
                                            truncation=True,
                                            add_special_tokens=False,
                                            max_length=40)
                payload = prefix_encoding['input_ids']
                if len(payload) > 40 - 2:
                    payload = payload[-(40 - 2):]
                input_ids = [tokenizer.cls_token_id] + payload

                with torch.no_grad():
                    result = model({
                        'image': img,
                        'prefix': torch.tensor(input_ids).unsqueeze(0).cuda(),
                    })
                cap = tokenizer.decode(result['predictions'][0].tolist(), skip_special_tokens=True)
                # logger.info(f'Train - Epoch {e} - Sample input: {sample_data}')
                # sample_data = recursive_to_device(sample_data, 'cuda')
                # sample_output = model(sample_data)
                logger.info(f'Train - Epoch {e} - Sample output: {cap}')
            
            model.train()
        logger.info(f'Validation starts')
        with torch.no_grad():
            model.train()
            val_loss = 0
            # batch_bar = tqdm(val_loader)
            batch_start = time.time()
            last = time.time()
            for id, data in enumerate(val_loader):
                if time.time() - last_rest_time > GPU_REST_INTERVAL:
                    last_rest_time = time.time()
                    logger.info(f'Resting GPU for {GPU_REST_DURATION}s')
                    time.sleep(GPU_REST_DURATION)
                start = time.time()
                data = recursive_to_device(data, 'cuda')
                loss_dict = model(data)
                loss = sum(loss_dict.values())
                train_loss += loss.item()
                val_loss += loss.item()
                end = time.time()
                logger.info(f'Val - ({id + 1}/{len(val_loader)}) - Loss: {loss.item()} - ETA: {(end - last) * len(val_loader):.2f}s - Elapsed: {time.time() - batch_start:.2f}s')
                last = time.time()
                # batch_bar.set_description(f'val_loss: {loss.item()}')
            model.train()
            logger.info(f'Val - Epoch {e} - Loss: {val_loss / len(val_loader)}')

from datasets import load_dataset

if __name__ == '__main__':
    cfg = Config(cfg, {})
    image_transform = get_multi_scale_image_transform(cfg, is_train=True)
    val_image_transform = get_multi_scale_image_transform(cfg, is_train=False)
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased', do_lower_case=True)

    train_dataset = get_train_dataset(tokenizer, image_transform)
    val_dataset = get_val_dataset(tokenizer, val_image_transform)
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn, num_workers=NUM_WORKERS)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn, num_workers=NUM_WORKERS)

    sample_data = train_dataset[0]

    logger = logging.getLogger('git_trainer')
    logger.setLevel(logging.DEBUG)

    # Create file handler
    fh = logging.FileHandler('app.log')
    fh.setLevel(logging.DEBUG)

    # Create formatter and add it to the handler
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)

    # logger.propagate = False

    logger.info(f'Using device: {device}')

    # Add the handler to the logger

    model = get_git_model(tokenizer, param)
    model.train()
    model.cuda()
    model.image_encoders.eval()
    print(model)
    if CHECKPOINT_USE:
        print("Using checkpoint: ", CHECKPOINT_USE)
        checkpoint = torch.load(CHECKPOINT_USE)["model"]
        # for key, value in checkpoint.items():
        #     if "image_encoder" not in key:
        #         model.state_dict()[key].copy_(value)
        model.textual.load_state_dict(checkpoint)

    optimizer = torch.optim.AdamW([
        # {'params': model.image_encoders.parameters(), 'lr': 1e-5},
        {'params': model.textual.parameters(), 'lr': 1e-4},
    ])

    train(model, optimizer, train_loader, val_loader)