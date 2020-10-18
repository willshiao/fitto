from sklearn import preprocessing
import numpy as np

def Normalize(pose_scores, keypoint_scores, keypoint_coords):
  drop = [] # hold indices to drop
  for pi in range(len(pose_scores)):
    if pose_scores[pi] == 0.:
        break
    for ki, (s, c) in enumerate(zip(keypoint_scores[pi, :], keypoint_coords[pi, :, :])):
      # filter out too low of score
      if (s > 0.2):
          drop.append(ki)

  # trying to drop coordinate that we don't want        
  keypoint_coords = np.drop(keypoint_coords, drop)

  minVal= np.amin(keypoint_coords, axis=0) # holds min x and y values of the coordinates
  # scale coodrinates
  for i in range(len(keypoint_coords)):
      for j in range(len(keypoint_coords[i])):
          keypoint_coords[i][j] -= minVal
  # normalize
  normalized_keypoint_coords  = preprocessing.normalize(keypoint_coords, norm='l2')
  return normalized_keypoint_coords