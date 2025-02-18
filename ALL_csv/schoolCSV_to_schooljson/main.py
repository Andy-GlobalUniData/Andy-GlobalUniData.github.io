import csv
import json
import os

current_dir = os.path.dirname(os.path.abspath(__file__))

School_name = ""

School_name_list = []

# 設定檔案目錄
directory = current_dir + "\input"  # 替換成你的目錄路徑
output_txt = current_dir + "\ok_school.txt"  # 輸出 TXT 檔案的名稱


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
    # 開啟 TXT 檔案以寫入模式
    with open(output_txt, 'w', encoding='utf-8') as txt_file:
        # 讀取資料夾中的所有檔案
        for filename in os.listdir(directory):
            # 檢查是否為 CSV 檔案
            if filename.endswith(".csv"):
                School_name = filename.replace(" Department_Intro.csv", "")
                School_name_list.append(School_name)

                txt_file.write(School_name + '\n')

    print(f"所有 CSV 檔案名稱已輸出至 {output_txt}")

    for School_name in School_name_list:
        print(School_name)
        csv_path =  current_dir + "\\input\\" + School_name + ' Department_Intro.csv'
        json_path =  current_dir + "\\output\\" + School_name + ' Department_Intro.json'

        csv_to_json(csv_path, json_path)

if __name__ == "__main__":
    main()

