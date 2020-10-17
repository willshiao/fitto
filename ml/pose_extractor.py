import numpy as np
import cv2
import time
import argparse
import os
import torch

import posenet

class PoseExtractor:
    __init__(self, cuda=True):
        self.model = posenet.load_model(args.model)
        self.cuda = cuda
        if cuda:
            self.model = self.model.cuda()
        self.output_stride = self.model.output_stride

    def get_poses_from_video(self, vid_path, frame_cb = None, skip_every_frames=10, skip_first=0):
        cap = cv2.VideoCapture(vid_path)
        if skip_first > 0:
            cap.set(cv2.CAP_PROP_POS_FRAMES, skip_first)
        while(cap.isOpened()):
            cnt += 1
            for i in range(10):
                cap.grab()
            input_image, display_image, output_scale = posenet.read_cap(
                cap, scale_factor=args.scale_factor, output_stride=output_stride)

            with torch.no_grad():
                input_image = torch.Tensor(input_image)
                if self.cuda:
                    input_image = input_image.cuda()

                heatmaps_result, offsets_result, displacement_fwd_result, displacement_bwd_result = self.model(input_image)
                pose_scores, keypoint_scores, keypoint_coords = posenet.decode_multiple_poses(
                    heatmaps_result.squeeze(0),
                    offsets_result.squeeze(0),
                    displacement_fwd_result.squeeze(0),
                    displacement_bwd_result.squeeze(0),
                    output_stride=output_stride,
                    max_pose_detections=1,
                    min_pose_score=0.25)

                if frame_cb is not None:
                    frame_cb(pose_scores, keypoint_scores, keypoint_coords)
        return True
