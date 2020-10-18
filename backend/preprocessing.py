from sklearn import preprocessing
import numpy as np

def Normalize(data):
  normalized  = preprocessing.normalize(data, norm='l2')
  return normalized