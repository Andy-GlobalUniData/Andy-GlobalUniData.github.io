document.addEventListener("DOMContentLoaded", function () {
    const degreeSelectDiv = document.getElementById("degree-select");
    degreeSelectDiv.innerHTML = "loading...";

    // 讀取 Degree_data.json 資料
    fetch("data/Degree_data.json")
        .then(response => response.json())
        .then((data) => {
            console.log("載入學位資料：", data);

            const degreeLevels = data;
            const degreeOptions = Object.keys(degreeLevels).map(degree => `
                <label><input type="checkbox" class="degree-checkbox" value="${degree}" checked> ${degree}</label><br>
            `).join("");

            degreeSelectDiv.innerHTML = `
                <h3>Select Degree Level</h3>
                <label><input type="checkbox" class="degree-checkbox" value="No Filter"> No Filter</label><br>
                ${degreeOptions}
            `;

            degreeSelectDiv.addEventListener("change", function (event) {
                const selectedDegrees = [...document.querySelectorAll(".degree-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                if (selectedDegrees.includes("No Filter")) {
                    document.querySelectorAll(".degree-checkbox").forEach(checkbox => {
                        if (checkbox.value !== "No Filter") {
                            checkbox.checked = false;
                            checkbox.disabled = true;
                        }
                    });
                    dataTable.column(3).search("").draw();  // 沒有選擇學位時顯示所有資料
                } else {
                    document.querySelectorAll(".degree-checkbox").forEach(checkbox => {
                        checkbox.disabled = false;
                    });

                    let degreeFilter = selectedDegrees.reduce((acc, degree) => {
                        const degreeList = degreeLevels[degree];
                        if (degreeList) {
                            acc.push(degreeList.join("|"));
                        }
                        return acc;
                    }, []).join("|");

                    console.log("Selected degree filter: ", degreeFilter); // Debugging log

                    if ($.fn.dataTable.isDataTable('#json-table')) {
                        var table = $('#json-table').DataTable();
                        console.log("DataTable instance: ", table); // Debugging log

                        table.column(3).search(degreeFilter, true, false).draw();
                    } else {
                        console.error("DataTable is not initialized.");
                    }
                }
            });

            degreeSelectDiv.dispatchEvent(new Event("change"));
        })
        .catch(error => {
            console.error("載入學位資料失敗：", error);
            degreeSelectDiv.innerHTML = "Loading failed, please try again.";
        });
});

$(document).ready(function() {
    // Ensure degreeFilter is correctly set
    $('#degree-select').on('change', function() {
        var degreeFilter = $(this).val();
        console.log("Selected degree filter: ", degreeFilter); // Debugging log

        // Ensure DataTable is initialized
        if ($.fn.dataTable.isDataTable('#json-table')) {
            var table = $('#json-table').DataTable();
            console.log("DataTable instance: ", table); // Debugging log

            // Apply the filter
            table.column(3).search(degreeFilter, true, false).draw();
        } else {
            console.error("DataTable is not initialized.");
        }
    });
});
