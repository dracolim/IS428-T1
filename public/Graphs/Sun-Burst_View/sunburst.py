# -*- coding: utf-8 -*-
"""
Created on Thu Apr 16 16:58:44 2020

@author: Nidhi
"""

import numpy as np
import pandas as pd
import os

#Replace while maintaining ratio
def assign():
    if np.random.randint(1,100)<=58:    # Use 58 for 2016; Use 60 for 2019
        return "Yes"
    else:
        return "No"
    
#Set path
cur_Dir = os.getcwd();
fileName = "mental-heath-in-tech-2016_cleaned.csv"

#Read data
data = pd.read_csv(os.path.join(cur_Dir,fileName))

#Use for 2016/2019 data
#Pre-Process : Replace "I don't know" 
data.loc[(data['Do you have a family history of mental illness?']=="I don't know"), 'Do you have a family history of mental illness?'] = assign();


hist = ["Yes", "No"]
gender = ["Male", "Female","Other"]
ans = ["Yes", "No", "Some of them"] 
#ans = ["Yes", "No", "Some of them"]    # Use for 2016/2019

print("------Total responders: "+str(len(data))+"--------")

for i in hist:
    for j in gender:
        for k in ans:
            
            #Use for2016/2019   # disorder -> issue (2016->2019)
            x = len(data.loc[(data['Do you have a family history of mental illness?']==i) & (data['What is your gender?']==j) & 
                             (data['Would you feel comfortable discussing a mental health disorder with your coworkers?']==k)])
            
            #Use for 2014
            #x = len(data.loc[(data['family_history']==i) & (data['Gender']==j) & (data['coworkers']==k)])
            
            print("Has Family History?: "+ str(i))
            print("Gender: "+str(j))
            print("Comfortable to discuss?: "+str(k))
            print("Count: "+str(x))
            print("---------")

