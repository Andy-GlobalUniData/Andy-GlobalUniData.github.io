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
                ${degreeOptions}
            `;

            degreeSelectDiv.addEventListener("change", function () {
                const selectedDegrees = [...document.querySelectorAll(".degree-checkbox:checked")]
                    .map(checkbox => checkbox.value);

                if (selectedDegrees.length === 0) {
                    dataTable.column(3).search("").draw();  // 沒有選擇學位時顯示所有資料
                } else {
                    let degreeFilter = selectedDegrees.reduce((acc, degree) => {
                        const degreeList = degreeLevels[degree];
                        if (degreeList) {
                            acc.push(degreeList.join("|"));
                        }
                        return acc;
                    }, []).join("|");

                    dataTable.column(3).search(degreeFilter, true, false).draw();
                }
            });

            degreeSelectDiv.dispatchEvent(new Event("change"));
        })
        .catch(error => {
            console.error("載入學位資料失敗：", error);
            degreeSelectDiv.innerHTML = "Loading failed, please try again.";
        });
});
