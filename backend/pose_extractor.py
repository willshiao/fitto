import numpy as np
import cv2
import time
import argparse
import os
import torch

import posenet

class PoseExtractor:
    def __init__(self, cuda=True, model=101, scale_factor=1.0):
        self.model = posenet.load_model(model)
        self.scale_factor = scale_factor
        self.cuda = cuda
        if cuda:
            self.model = self.model.cuda()
        self.output_stride = self.model.output_stride

    def get_poses_from_video(self, vid_path, frame_cb = None, skip_every_frames=8, skip_first=0):
        frames_elasped = 0
        cap = cv2.VideoCapture(vid_path)
        fps = cap.get(5)
        # print(f'FPS: {fps}')

        # if skip_first > 0:
        #     cap.set(cv2.CAP_PROP_POS_FRAMES, skip_first)
        cnt = 0
        try:
            while(cap.isOpened()):
                frames_elasped += 1
                done = False
                for _ in range(skip_every_frames):
                    if cap.isOpened():
                        cap.grab()
                        frames_elasped += 1
                    else:
                        done = True
                        break
                if done:
                    break

                if not cap.isOpened():
                    break
                try:
                    input_image, display_image, output_scale = posenet.read_cap(
                        cap, scale_factor=self.scale_factor, output_stride=self.output_stride)
                except Exception as e:
                    print('Failed to read frame: ', e)
                    break

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
                        output_stride=self.output_stride,
                        max_pose_detections=1,
                        min_pose_score=0.25)

                    if frame_cb is not None:
                        frame_cb(pose_scores, keypoint_scores, keypoint_coords, frames_elasped, fps, cnt)
                        cnt += 1
        except Exception as e:
            print('Error running: ', e)
            return False
        return True
