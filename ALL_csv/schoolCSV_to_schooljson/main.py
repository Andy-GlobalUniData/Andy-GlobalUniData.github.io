import csv
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

School_name = ""

# csv_path =  current_dir + "\\" + 'temp_data.csv'
# json_path =  current_dir + "\\" + 'temp_data.json'


def csv_to_json(csv_file, json_file):
    data = []
    
    with open(csv_file, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    
    with open(json_file, mode='w', encoding='utf-8') as file:
        json.dump(data, file, indent=4, ensure_ascii=False)
    
    print(f"Successfully converted {csv_file} to {json_file}")

def read_txt_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = [line.strip() for line in file.readlines()]
        return lines
    except FileNotFoundError:
        print("找不到檔案，請確認路徑是否正確。")
        return []
    except Exception as e:
        print(f"讀取檔案時發生錯誤: {e}")
        return []

def main():
    file_path = current_dir + "\ok_school.txt"  # 替換成你的檔案名稱
    lines = read_txt_file(file_path)
    for School_name in lines:
        print(School_name)

        csv_path =  current_dir + "\\" + School_name + ' Department_Intro.csv'
        json_path =  current_dir + "\\output\\" + School_name + ' Department_Intro.json'

        csv_to_json(csv_path, json_path)

if __name__ == "__main__":
    main()

