document.addEventListener("DOMContentLoaded", function () {
    fetch("https://andy-globalunidata.github.io/old_project/v0.2/data/data.json")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("#json-table tbody");
            tbody.innerHTML = ""; 

            data.forEach(item => {
                tbody.innerHTML += 
                `<tr>
                    <td>${item.School_name || 'N/A' }</td>
                    <td>${item.Department_name || 'N/A' }</td>
                    <td><a href="${item.Website_Link}" target="_blank">${item.Website_Link}</a></td>
                    <td>${item.Degree || 'N/A' }</td>
                    <td>${item.Academic_field || 'N/A' }</td>
                    <td>${item.Field_degree || 'N/A' }</td>
                    <td>${item.Time_system || 'N/A' }</td>
                    <td>${item.Duration_Study || 'N/A' }</td>
                    <td>${item.Internship || 'N/A' }</td>
                    <td>${item.Work_visa || 'N/A' }</td>
                    <td>${item.Overview || 'N/A' }</td>
                    <td>${item.Tuition_min || 'N/A' }</td>
                    <td>${item.Tuition_max || 'N/A' }</td>
                    <td>${item.Application_fees || 'N/A' }</td>
                    <td>${item.Tuition_overview || 'N/A' }</td>
                    <td>${item.Preferred_Language || 'N/A' }</td>
                    <td>${item.IELTS_score || 'N/A' }</td>
                    <td>${item.IELTS_listen || 'N/A' }</td>
                    <td>${item.IELTS_speak || 'N/A' }</td>
                    <td>${item.IELTS_read || 'N/A' }</td>
                    <td>${item.IELTS_write || 'N/A' }</td>
                    <td>${item.IELTS_overview || 'N/A' }</td>
                    <td>${item.TOEFL_score || 'N/A' }</td>
                    <td>${item.TOEFL_listen || 'N/A' }</td>
                    <td>${item.TOEFL_speak || 'N/A' }</td>
                    <td>${item.TOEFL_read || 'N/A' }</td>
                    <td>${item.TOEFL_write || 'N/A' }</td>
                    <td>${item.TOEFL_overview || 'N/A' }</td>
                    <td>${item.Entry_Requirements || 'N/A' }</td>
                    <td>${item.Background_Required || 'N/A' }</td>
                    <td>${item.Conditional_Admission || 'N/A' }</td>
                    <td>${item.School_Grades || 'N/A' }</td>
                    <td>${item.Taiwan_Grades || 'N/A' }</td>
                    <td>${item.Semester_Start || 'N/A' }</td>
                    <td>${item.Deadline || 'N/A' }</td>
                </tr>`;
            });

             // 啟用 DataTable 插件
             var table = $("#json-table").DataTable();

             // 為每個搜尋框添加事件監聽器，並根據對應欄位進行搜尋
             $('#search-school-name').on('keyup', function() {
                table.column(0).search(this.value).draw(); // 根據 School_name 搜尋
            });
            
            $('#search-department-name').on('keyup', function() {
                table.column(1).search(this.value).draw(); // 根據 Department_name 搜尋
            });
            
            $('#search-website-link').on('keyup', function() {
                table.column(2).search(this.value).draw(); // 根據 Website_Link 搜尋
            });
            
            $('#search-degree').on('keyup', function() {
                table.column(3).search(this.value).draw(); // 根據 Degree 搜尋
            });
            
            $('#search-academic-field').on('keyup', function() {
                table.column(4).search(this.value).draw(); // 根據 Academic_field 搜尋
            });
            
            $('#search-field-degree').on('keyup', function() {
                table.column(5).search(this.value).draw(); // 根據 Field_degree 搜尋
            });
            
            $('#search-time-system').on('keyup', function() {
                table.column(6).search(this.value).draw(); // 根據 Time_system 搜尋
            });
            
            $('#search-duration-study').on('keyup', function() {
                table.column(7).search(this.value).draw(); // 根據 Duration_Study 搜尋
            });
            
            $('#search-internship').on('keyup', function() {
                table.column(8).search(this.value).draw(); // 根據 Internship 搜尋
            });
            
            $('#search-work-visa').on('keyup', function() {
                table.column(9).search(this.value).draw(); // 根據 Work_visa 搜尋
            });
            
            $('#search-overview').on('keyup', function() {
                table.column(10).search(this.value).draw(); // 根據 Overview 搜尋
            });
            
            $('#search-tuition-min').on('keyup', function() {
                table.column(11).search(this.value).draw(); // 根據 Tuition_min 搜尋
            });
            
            $('#search-tuition-max').on('keyup', function() {
                table.column(12).search(this.value).draw(); // 根據 Tuition_max 搜尋
            });
            
            $('#search-application-fees').on('keyup', function() {
                table.column(13).search(this.value).draw(); // 根據 Application_fees 搜尋
            });
            
            $('#search-tuition-overview').on('keyup', function() {
                table.column(14).search(this.value).draw(); // 根據 Tuition_overview 搜尋
            });
            
            $('#search-preferred-language').on('keyup', function() {
                table.column(15).search(this.value).draw(); // 根據 Preferred_Language 搜尋
            });
            
            $('#search-ielts-score').on('keyup', function() {
                table.column(16).search(this.value).draw(); // 根據 IELTS_score 搜尋
            });
            
            $('#search-ielts-listen').on('keyup', function() {
                table.column(17).search(this.value).draw(); // 根據 IELTS_listen 搜尋
            });
            
            $('#search-ielts-speak').on('keyup', function() {
                table.column(18).search(this.value).draw(); // 根據 IELTS_speak 搜尋
            });
            
            $('#search-ielts-read').on('keyup', function() {
                table.column(19).search(this.value).draw(); // 根據 IELTS_read 搜尋
            });
            
            $('#search-ielts-write').on('keyup', function() {
                table.column(20).search(this.value).draw(); // 根據 IELTS_write 搜尋
            });
            
            $('#search-ielts-overview').on('keyup', function() {
                table.column(21).search(this.value).draw(); // 根據 IELTS_overview 搜尋
            });
            
            $('#search-toefl-score').on('keyup', function() {
                table.column(22).search(this.value).draw(); // 根據 TOEFL_score 搜尋
            });
            
            $('#search-toefl-listen').on('keyup', function() {
                table.column(23).search(this.value).draw(); // 根據 TOEFL_listen 搜尋
            });
            
            $('#search-toefl-speak').on('keyup', function() {
                table.column(24).search(this.value).draw(); // 根據 TOEFL_speak 搜尋
            });
            
            $('#search-toefl-read').on('keyup', function() {
                table.column(25).search(this.value).draw(); // 根據 TOEFL_read 搜尋
            });
            
            $('#search-toefl-write').on('keyup', function() {
                table.column(26).search(this.value).draw(); // 根據 TOEFL_write 搜尋
            });
            
            $('#search-toefl-overview').on('keyup', function() {
                table.column(27).search(this.value).draw(); // 根據 TOEFL_overview 搜尋
            });
            
            $('#search-entry-requirements').on('keyup', function() {
                table.column(28).search(this.value).draw(); // 根據 Entry_Requirements 搜尋
            });
            
            $('#search-background-required').on('keyup', function() {
                table.column(29).search(this.value).draw(); // 根據 Background_Required 搜尋
            });
            
            $('#search-conditional-admission').on('keyup', function() {
                table.column(30).search(this.value).draw(); // 根據 Conditional_Admission 搜尋
            });
            
            $('#search-school-grades').on('keyup', function() {
                table.column(31).search(this.value).draw(); // 根據 School_Grades 搜尋
            });
            
            $('#search-taiwan-grades').on('keyup', function() {
                table.column(32).search(this.value).draw(); // 根據 Taiwan_Grades 搜尋
            });
            
            $('#search-semester-start').on('keyup', function() {
                table.column(33).search(this.value).draw(); // 根據 Semester_Start 搜尋
            });
            
            $('#search-deadline').on('keyup', function() {
                table.column(34).search(this.value).draw(); // 根據 Deadline 搜尋
            });
            
             

            // 設定列寬與行高調整
            $("#json-table th").resizable({
                handles: "e",
                minWidth: 50,
                maxWidth: 300,
                alsoResize: "#json-table td",
                resize: function(event, ui) {
                    const index = $(this).index();
                    $("#json-table td").each(function() {
                        if ($(this).index() === index) {
                            $(this).width(ui.size.width);
                        }
                    });
                }
            });

            // 行高設定
            $("#json-table td").each(function() {
                $(this).css("height", "40px");
            });

            $("#json-table tr").resizable({
                handles: "s",
                minHeight: 40,
                maxHeight: 100,
                alsoResize: "#json-table td",
                resize: function(event, ui) {
                    $(this).find("td").each(function() {
                        $(this).height(ui.size.height);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error loading JSON:", error);
            alert("Error loading JSON: " + error.message);
        });
});
