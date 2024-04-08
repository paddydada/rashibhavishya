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

  // Trigger change event on file dropdown to load JSON data when the page loads
  fileDropdown.dispatchEvent(new Event("change"));

  // Add event listener to file dropdown
  fileDropdown.addEventListener("change", function (event) {
    const selectedFile = event.target.value;

    // Save selected file name in local storage
    localStorage.setItem("selected_rashi", selectedFile);

    // Fetch JSON data from the selected file
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

        // Trigger change event on keys dropdown to load initial selected data
        keysDropdown.dispatchEvent(new Event("change"));
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  });

  // Add event listener to keys dropdown
  keysDropdown.addEventListener("change", function (event) {
    const selectedKey = event.target.value;
    const selectedFile = fileDropdown.value;

    // Fetch JSON data from the selected file
    fetch(selectedFile)
      .then((response) => response.json())
      .then((data) => {
        // Find the entry with the selected key
        const selectedEntry = data.find(
          (entry) => Object.keys(entry)[0] === selectedKey
        );

        // Store selected key and its corresponding data in local storage
        localStorage.setItem("selectedKey", selectedKey);
        localStorage.setItem(
          "selectedData",
          JSON.stringify(selectedEntry[selectedKey])
        );

        // Update values dropdown with corresponding values
        populateValuesDropdown(selectedEntry[selectedKey]);
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  });

  // Function to populate the values dropdown
  function populateValuesDropdown(values) {
    // Clear previous options
    valuesDropdown.innerHTML = "";

    // Populate values dropdown with options from the provided values
    for (const key in values) {
      const option = document.createElement("option");
      option.text = values[key];
      option.value = values[key];
      valuesDropdown.add(option);
    }
  }

  // Event listener for dates input
  // Event listener for dates input
  // Event listener for dates input
  datesInput.addEventListener("change", function (event) {
    const selectedDate = new Date(event.target.value);
    const dayOfWeek = selectedDate.getDay();
    let selectedDayFile;

    // Determine the file based on the day of the week
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

    // Fetch JSON data from the selected file
    fetch(selectedDayFile)
      .then((response) => response.json())
      .then((data) => {
        // Retrieve selected rashi file name from local storage
        const selectedRashi = localStorage.getItem("selected_rashi");

        // Extract the Rashi name from the file name
        const rashiName = selectedRashi
          ? selectedRashi.split(".")[0].toUpperCase()
          : null;

        // Check if the Rashi name is valid
        if (rashiName && data[rashiName + "PL"] && data[rashiName + "MN"]) {
          // Create the dynamic calculation names for PL and MN
          const rashiPl = rashiName + "PL";
          const rashiMn = rashiName + "MN";

          // Find entries for the calculated names
          const rashiPlData = data[rashiPl];
          const rashiMnData = data[rashiMn];

          // Calculate sum of values for the dynamic names
          const rashiPlSum = Object.values(rashiPlData).reduce(
            (acc, val) => acc + val,
            0
          );
          const rashiMnSum = Object.values(rashiMnData).reduce(
            (acc, val) => acc + val,
            0
          );

          // Store the sums in local storage
          localStorage.setItem("rashiPl", rashiPl);
          localStorage.setItem("rashiMn", rashiMn);

          localStorage.setItem("rashiPlSum", rashiPlSum);
          localStorage.setItem("rashiMnSum", rashiMnSum);
        } else {
          console.error("Invalid or missing Rashi selected.");
        }
      })
      .catch((error) => console.error("Error loading JSON data:", error));
  });
});
