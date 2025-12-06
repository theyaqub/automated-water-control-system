
// water level simulation


// This code simulates a water level in a container, filling and emptying it over time
let filling = true;
let level = 0;
function updateWaterLevel() {
    // Simulate water level (replace with actual sensor data in production)
    const waterElement = document.getElementById('water');
    const levelText = document.getElementById('levelText');
    // Update water height and text
    if (filling) {
        level += 1; // Ensure level is not negative
        if (level >= 100) {
            filling = false; // Stop filling when full
        }
    }
    else {
        level -= 1; // Ensure level does not exceed 100%
        if (level <= 0) {
            filling = true; // Start filling again when empty
        }
    }
    waterElement.style.height = `${level}%`;
    levelText.textContent = `Level: ${level}%`;
}

// Update every 2 seconds
setInterval(updateWaterLevel, 1000);

// Initial update
updateWaterLevel();



// status filling or emptying
function updateStatus() {
    const statusElement = document.getElementById('status');
    if (filling) {
        statusElement.textContent = 'Filling...';
    } else {
        statusElement.textContent = 'Emptying...';
    }
    //update the color of the status circle
    const statusCircle = document.querySelector('.stable_filling');
    if (level < 25) {
        statusCircle.innerHTML = `<div class="flex items-center gap-2 text-amber-300">
        <span class="material-symbols-outlined">warning</span> 
                <p>Critical</p>
        </div>`;
    }
    else{
        statusCircle.innerHTML = `<div class="flex items-center gap-2 text-green-500">
        <span class="material-symbols-outlined">check_circle</span> 
                <p>Stable</p>
        </div>`;
    }
}
// calling updataStatud every second
setInterval(updateStatus, 1000);


// fetching data from the localhost:3000/ endpoint server
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text(); // Use .text() to get the response as text
        

        let fect=document.querySelector('.fec');
        fect.innerHTML = `${data}`;
        console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
fetchData(); // Initial fetch

async function sendData(){
    try{
        const response =await fetch('http://localhost:3000/data',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ level: level, status: filling ? 'filling' : 'emptying' })
        })
        console.log('Data sent:', { level: level, status: filling ? 'filling' : 'emptying' });
    }catch (error) {
        console.error('Error sending data:', error);
    }  };

// Send data every 5 seconds
setInterval(sendData, 5000);