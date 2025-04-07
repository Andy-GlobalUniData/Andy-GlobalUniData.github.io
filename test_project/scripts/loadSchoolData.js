document.addEventListener("DOMContentLoaded", function () {
    fetch("data/School_data.json")
        .then(response => response.json())
        .then((data) => {
            // Dynamically load school data into the designated section
            const schoolDataTableBody = document.querySelector("#school-data-table tbody");
            schoolDataTableBody.innerHTML = data.map(school => `
                <tr>
                    <td>${school.School_name}</td>
                    <td>${school.Country}</td>
                    <td>${school.City}</td>
                    <td>${school.Number_of_departments}</td>
                </tr>
            `).join("");

            // Initialize DataTable with custom configuration
            $("#school-data-table").DataTable({
                pageLength: 100, // Default display 100 rows
                lengthMenu: [[10, 100, 500, 1000], [10, 100, 500, 1000]] // Dropdown options
            });
        })
        .catch(error => {
            console.error("Failed to load School_data.json:", error);
            document.getElementById("school-data-table-container").innerHTML = "Failed to load school data.";
        });
});
