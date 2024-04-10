document.addEventListener("DOMContentLoaded", function () {
    const fileDropdown = document.getElementById("files");
    const keysDropdown = document.getElementById("keys");
    const valuesDropdown = document.getElementById("values");
    const datesInput = document.getElementById("dates");

    // Retrieve selected file name from local storage
    const storedRashi = localStorage.getItem("selected_rashi");
    if (storedRashi) {
        fileDropdown.value = storedRashi;
    }

    fileDropdown.dispatchEvent(new Event("change"));

    fileDropdown.addEventListener("change", function (event) {
        const selectedFile = event.target.value;

        localStorage.setItem("selected_rashi", selectedFile);

        fetch(selectedFile)
            .then((response) => response.json())
            .then((data) => {
                // Clear previous options
                keysDropdown.innerHTML = "";

                data.forEach((entry) => {
                    const key = Object.keys(entry)[0];
                    const option = document.createElement("option");
                    option.text = key;
                    option.value = key;
                    keysDropdown.add(option);
                });

                keysDropdown.dispatchEvent(new Event("change"));
            })
            .catch((error) => console.error("Error loading JSON data:", error));
    });

    keysDropdown.addEventListener("change", function (event) {
        const selectedKey = event.target.value;
        const selectedFile = fileDropdown.value;

        fetch(selectedFile)
            .then((response) => response.json())
            .then((data) => {
                // Find the entry with the selected key
                const selectedEntry = data.find(
                    (entry) => Object.keys(entry)[0] === selectedKey
                );

                localStorage.setItem("selectedKey", selectedKey);
                localStorage.setItem(
                    "selectedData",
                    JSON.stringify(selectedEntry[selectedKey])
                );

                populateValuesDropdown(selectedEntry[selectedKey]);
            })
            .catch((error) => console.error("Error loading JSON data:", error));
    });

    function populateValuesDropdown(values) {
        valuesDropdown.innerHTML = "";

        for (const key in values) {
            const option = document.createElement("option");
            option.text = values[key];
            option.value = values[key];
            valuesDropdown.add(option);
        }
    }

    datesInput.addEventListener("change", function (event) {
        const selectedDate = new Date(event.target.value);
        const dayOfWeek = selectedDate.getDay();
        let selectedDayFile;

        switch (dayOfWeek) {
            case 0: // Sunday
                selectedDayFile = "sunday.json";
                break;
            case 1: // Monday
                selectedDayFile = "monday.json";
                break;
            case 2: // Tuesday
                selectedDayFile = "tuesday.json";
                break;
            case 3: // Wednesday
                selectedDayFile = "wednesday.json";
                break;
            case 4: // Thursday
                selectedDayFile = "thursday.json";
                break;
            case 5: // Friday
                selectedDayFile = "friday.json";
                break;
            case 6: // Saturday
                selectedDayFile = "saturday.json";
                break;
            default:
                console.error("Invalid day selected.");
                return;
        }

        // Prompt for NSE and BSE values
        const nseValue = prompt("Enter NSE value:");
        const bseValue = prompt("Enter BSE value:");

        if (nseValue === null || bseValue === null) {
            console.log("NSE/BSE values not provided.");
            return;
        }

        localStorage.setItem("nseValue", nseValue); // Store the NSE value in local storage
        localStorage.setItem("bseValue", bseValue); // Store the BSE value in local storage
        localStorage.setItem("selectedDate", event.target.value); // Store the selected date in local storage

        fetch(selectedDayFile)
            .then((response) => response.json())
            .then((data) => {
                const selectedRashi = localStorage.getItem("selected_rashi");

                const rashiName = selectedRashi
                    ? selectedRashi.split(".")[0].toUpperCase()
                    : null;

                if (rashiName && data[rashiName + "PL"] && data[rashiName + "MN"]) {
                    const rashiPl = rashiName + "PL";
                    const rashiMn = rashiName + "MN";

                    const rashiPlObject = createObjectWithNSEValues(
                        data[rashiPl],
                        parseFloat(bseValue)
                    );
                    const rashiMnObject = createObjectWithBSEValues(
                        data[rashiMn],
                        parseFloat(nseValue)
                    );

                    localStorage.setItem("rashiPlObject", JSON.stringify(rashiPlObject));
                    localStorage.setItem("rashiMnObject", JSON.stringify(rashiMnObject));

                    const rashiMnChartTitle = `${rashiName} Mn Chart (NSE)`;
                    const rashiPlChartTitle = `${rashiName} Pl Chart (BSE)`;
                    prepareChart("nseChart", rashiMnChartTitle, rashiMnObject);
                    prepareChart("bseChart", rashiPlChartTitle, rashiPlObject);
                } else {
                    console.error("Invalid or missing Rashi selected.");
                }
            })
            .catch((error) => console.error("Error loading JSON data:", error));
    });

    function createObjectWithBSEValues(data, nseInput) {
        const obj = {};
        for (const key in data) {
            obj[key] = data[key] + nseInput; // Add NSE input to existing BSE values
        }
        return obj;
    }

    function createObjectWithNSEValues(data, bseInput) {
        const obj = {};
        for (const key in data) {
            obj[key] = data[key] + bseInput; // Add BSE input to existing NSE values
        }
        return obj;
    }

    function prepareChart(containerId, title, data) {
        Highcharts.chart(containerId, {
            chart: {
                type: "column",
            },
            title: {
                text: title,
            },
            xAxis: {
                categories: Object.keys(data),
            },
            yAxis: {
                title: {
                    text: "points",
                },
            },
            series: [
                {
                    name: "rashi",
                    data: Object.values(data),
                },
            ],
            accessibility: { 
            enabled: true,
        },
        });
    }

    // Function to clear previous data and reload the page
    document.getElementById("refresh").addEventListener("click", function () {
        localStorage.clear();
        location.reload();
    });

    function changeLanguage() {
        // Language change logic here...
    }

    // Call the function to set labels initially
    changeLanguage();

    // Add event listener for language select change
    document
        .getElementById("language")
        .addEventListener("change", changeLanguage);
});
