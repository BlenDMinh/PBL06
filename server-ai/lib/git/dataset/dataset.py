import torch
from torch.utils.data import Dataset
from PIL import Image
import os
from pycocotools.coco import COCO

class COCODataset(Dataset):
    def __init__(self, root, annFile, tokenizer, max_text_len=40, transform=None, crop=None):
        self.root = root
        self.coco = COCO(annFile)
        self.ids = list(sorted(self.coco.imgs.keys()))

        if crop is not None:
            random_index = torch.randperm(len(self.ids))[:crop]
            self.ids = [self.ids[i] for i in random_index]

        self.transform = transform
        self.tokenizer = tokenizer  
        self.max_text_len = max_text_len

    def __getitem__(self, index):
        img_id = self.ids[index]
        ann_ids = self.coco.getAnnIds(imgIds=img_id)
        target = self.coco.loadAnns(ann_ids)
        path = self.coco.loadImgs(img_id)[0]['file_name']
        img = Image.open(os.path.join(self.root, path)).convert('RGB')
        random_index = torch.randint(0, len(target), (1,)).item()
        target = target[random_index]['caption']
        prefix = ''

        prefix_encoding = self.tokenizer(
            prefix, padding='do_not_pad',
            add_special_tokens=False,
            truncation=True, max_length=self.max_text_len)
        target_encoding = self.tokenizer(
              target, padding='do_not_pad',
              add_special_tokens=False,
              truncation=True, max_length=self.max_text_len)
        need_predict = [0] * len(prefix_encoding['input_ids']) + [1] * len(target_encoding['input_ids'])
        payload = prefix_encoding['input_ids'] + target_encoding['input_ids']
        if len(payload) > self.max_text_len:
            payload = payload[-(self.max_text_len - 2):]
            need_predict = need_predict[-(self.max_text_len - 2):]
        input_ids = [self.tokenizer.cls_token_id] + payload + [self.tokenizer.sep_token_id]
        need_predict = [0] + need_predict + [1]

        data = {
            'caption_tokens': torch.tensor(input_ids),
            #'caption_lengths': len(input_ids),
            'need_predict': torch.tensor(need_predict),
            'image': img,
            # 'rect' field can be fed in 'caption', which tells the bounding box
            # region of the image that is described by the caption. In this case,
            # we can optionally crop the region.
            'caption': {},
            # this iteration can be used for crop-size selection so that all GPUs
            # can process the image with the same input size
            'iteration': 0,
        }

        if self.transform is not None:
            data = self.transform(data)

        return data

    def __len__(self):
        return len(self.ids)

base_crop = 4096 * 8

def get_train_dataset(tokenizer, transform=None):
    return COCODataset(root='F:/train2017',
                       annFile='D:/Coding/University/PBL06/PBL06/server-ai/lib/git/dataset/annotations/captions_train2017.json', 
                       tokenizer=tokenizer, 
                       transform=transform,
                       crop=base_crop
                       )

def get_val_dataset(tokenizer, transform=None):
    return COCODataset(root='F:/val2017',
                        annFile='D:/Coding/University/PBL06/PBL06/server-ai/lib/git/dataset/annotations/captions_val2017.json', 
                        tokenizer=tokenizer, 
                        transform=transform,
                        crop=base_crop // 4
                        )