import pandas as pd

def csv_to_html(csv_file, output_file="index.html"):
    # 讀取 CSV 檔案
    df = pd.read_csv(csv_file, encoding="latin1")
    
    # 轉換成 HTML 並加上 CSS 和 JavaScript
    html_content = df.to_html(index=False, classes="data-table")
    
    html_page = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>CSV Data</title>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .search-box {{ margin-bottom: 10px; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th, td {{ border: 1px solid black; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
        </style>
        <script>
            function searchTable() {{
                let input = document.getElementById("searchInput").value.toLowerCase();
                let table = document.getElementById("dataTable");
                let rows = table.getElementsByTagName("tr");
                for (let i = 1; i < rows.length; i++) {{
                    let cells = rows[i].getElementsByTagName("td");
                    let match = false;
                    for (let j = 0; j < cells.length; j++) {{
                        if (cells[j].innerText.toLowerCase().includes(input)) {{
                            match = true;
                            break;
                        }}
                    }}
                    rows[i].style.display = match ? "" : "none";
                }}
            }}
        </script>
    </head>
    <body>
        <h2>CSV Data</h2>
        <input type="text" id="searchInput" class="search-box" onkeyup="searchTable()" placeholder="Search...">
        {html_content.replace('<table border="1" class="dataframe data-table">', '<table border="1" id="dataTable">')}
    </body>
    </html>
    """
    
    # 儲存成 HTML 檔案
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_page)
    
    print(f"HTML file generated: {output_file}")

# 使用範例
csv_to_html("data.csv")
