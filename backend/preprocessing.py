import math
from collections import defaultdict
import cv2
import time
import argparse
import torch
from sklearn import preprocessing
import numpy as np
import posenet
import numpy as np
from scipy.spatial.distance import cosine, cdist
from fastdtw import fastdtw
import re
import numpy as np

EPS=0.000001

PART_NAMES = [
    "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist",
    "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"
]

def normalize(pose_scores, keypoint_scores, keypoint_coords, thresh=0.1):
    keypoint_scores = keypoint_scores.reshape((17, -1))
    keypoint_coords = keypoint_coords.reshape((17, 2))

    # Step 1: filter out bad scores
    mask = (keypoint_scores.ravel() > thresh)
    if not np.any(mask):
        return {}

    # Step 2: Crop
    min_x = np.min(keypoint_coords[mask, 0])
    min_y = np.min(keypoint_coords[mask, 1])
    keypoint_coords[:, 0] -= min_x
    keypoint_coords[:, 1] -= min_y

    # Step 3: Normalize
    normalized_coords = preprocessing.normalize(keypoint_coords, norm='l2')

    # Step 4: Convert to dict
    output = {}
    for i in range(17):
        if mask[i]:
            output[posenet.PART_NAMES[i]] = (normalized_coords[i, 0], normalized_coords[i, 1])
    return output

def to_timeseries(dictionaries):
    # combines list of dictionaries
    ts = defaultdict(list)

    # Iterate every part name and combine part values
    for mini_dict in dictionaries:
        for k, v in mini_dict.items():
            ts[k].append(v)
    return ts

def crop_dict(pose_dict):
    if pose_dict is None:
        return None
    min_x = 10**6
    min_y = 10**6
    for v in pose_dict.values():
        if v[0] <= min_x:
            min_x = v[0]
        if v[1] <= min_y:
            min_y = v[1]

    for k in pose_dict.keys():
        pose_dict[k][0] -= min_x
        pose_dict[k][1] -= min_y

    return pose_dict


def DTW(dict1, dict2, normalize_user=False):
    # computes the DTW between two dictionaries & values
    # outputs distances to dictionary distances
    distances = {}
    for key in dict1:
        if key in posenet.PART_NAMES:
            if key == 'leftEye' or key == 'rightEye':
                continue
            if dict1[key] and dict2[key]:
                x = np.array(dict1[key]) + EPS
                y = np.array(dict2[key]) + EPS
                if normalize_user:
                    x = preprocessing.normalize(x, norm='l2')
                # dists = cdist(x, y, 'cosine')
                # min_dists = np.mean(dists, axis=1)
                # distances[key] = np.mean(min_dists)
                # print(f'matrices for {key}:', x, y)
                dist, path = fastdtw(x, y, dist=cosine)
                scaled_dist = (1-dist/len(path))
                scaled_dist = (max(0, scaled_dist - 0.45) / 0.55)
                distances[key] = scaled_dist
                # distances[key] = 1
    return distances


def get_avg_dist(dist_dict):
    return np.mean(list(dist_dict.values()))

def get_part_to_move(distances):
    # Prints and outputs which body part to use
    # Calculated by body part with the highest distance in DTW
    if not distances:
        return ''
    movePart = max(distances, key=distances.get)
    res_list = re.sub(r"([a-z])([A-Z])","\g<1> \g<2>", movePart)
    movePart = ''.join(res_list).lower()
    print('Move your %s.' %movePart)
    return f'Try moving your {movePart}.'
