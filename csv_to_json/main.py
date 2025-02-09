import csv
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

csv_path =  current_dir + "\Department_Intro.csv"
json_path =  current_dir + "\Department_Intro.json"


def csv_to_json(csv_file, json_file):
    data = []
    
    with open(csv_file, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    
    with open(json_file, mode='w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
    
    print(f"Successfully converted {csv_file} to {json_file}")

# Example usage
csv_to_json(csv_path, json_path)
