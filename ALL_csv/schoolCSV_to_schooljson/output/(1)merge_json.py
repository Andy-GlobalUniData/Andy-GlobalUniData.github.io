import os
import json

current_dir = os.path.dirname(os.path.abspath(__file__))

def merge_json_files(input_folder, output_file):
    merged_data = []
    
    # 確保輸入資料夾存在
    if not os.path.exists(input_folder):
        print(f"資料夾 {input_folder} 不存在")
        return
    
    # 遍歷資料夾內的所有 JSON 檔案
    for filename in os.listdir(input_folder):
        if filename.endswith(".json"):
            file_path = os.path.join(input_folder, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        merged_data.extend(data)  # 如果是 list，展開合併
                    else:
                        merged_data.append(data)  # 如果是單一 dict，直接加入
            except Exception as e:
                print(f"讀取 {filename} 時發生錯誤: {e}")
    
    # 將合併後的資料寫入輸出檔案
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=4)
    
    print(f"合併完成，輸出檔案: {output_file}")

def main():
    merge_json_files(current_dir, "merged_output.json")
    
if __name__ == "__main__":
    main()
