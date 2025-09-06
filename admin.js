// ========================
// Admin Dashboard Script
// ========================

// Load Stats
function loadStats() {
  let scans = JSON.parse(localStorage.getItem("scanLogs")) || [];
  let total = scans.length;
  let genuine = scans.filter(s => s.status === "Genuine").length;
  let fake = scans.filter(s => s.status === "Fake").length;

  document.getElementById("totalScans").textContent = total;
  document.getElementById("genuineCount").textContent = genuine;
  document.getElementById("fakeCount").textContent = fake;

  renderLogs(scans);
}

// Render Logs into Table
function renderLogs(scans) {
  const tbody = document.getElementById("scanLogs");
  tbody.innerHTML = "";

  if (scans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No scans yet.</td></tr>`;
    return;
  }

  scans.slice(-10).reverse().forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.file}</td>
      <td>${log.status}</td>
      <td>${log.user || "Unknown"}</td>
      <td>${log.time}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Export Logs as CSV
function exportLogs() {
  let logs = JSON.parse(localStorage.getItem("scanLogs")) || [];
  if (!logs.length) return alert("No logs available to export.");

  let csvContent = "data:text/csv;charset=utf-8,File,Status,User,Time\n" +
    logs.map(l => `${l.file},${l.status},${l.user || "Unknown"},${l.time}`).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "scan_logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// User Management
document.getElementById("addUserForm").addEventListener("submit", function(e){
  e.preventDefault();
  const username = document.getElementById("username").value;
  const userEmail = document.getElementById("userEmail").value;
  const li = document.createElement("li");
  li.textContent = `${username} (${userEmail})`;
  document.getElementById("userList").appendChild(li);
  this.reset();
});

// Bulk Upload with API + Local Simulation
document.getElementById("bulkUploadForm").addEventListener("submit", async function(e){
  e.preventDefault();
  const files = document.getElementById("bulkFiles").files;
  if (files.length === 0) return alert("Please select at least one file.");

  alert(files.length + " files uploaded & scanning started...");

  const logs = JSON.parse(localStorage.getItem("scanLogs")) || [];
  const user = "Admin123"; // Example user
  for (let file of files) {
    const time = new Date().toLocaleString();
    let status = "Unknown";
    let dbStatus = "Not Found";

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      // Call API
      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json(); // Expected: {status:"Genuine"/"Fake", dbStatus:"..."}
        status = data.status || status;
        dbStatus = data.dbStatus || dbStatus;
      } else {
        // If API fails, fallback
        status = file.name.toLowerCase().includes("fake") ? "Fake" : "Genuine";
      }
    } catch (err) {
      // Local fallback simulation
      status = file.name.toLowerCase().includes("fake") ? "Fake" : "Genuine";
    }

    logs.push({
      file: file.name,
      user: user,
      status: status,
      dbStatus: dbStatus,
      time: time
    });

    // Optional: Update dashboard live for each file
    document.getElementById("totalScans").textContent = logs.length;
    document.getElementById("genuineCount").textContent = logs.filter(l => l.status === "Genuine").length;
    document.getElementById("fakeCount").textContent = logs.filter(l => l.status === "Fake").length;
  }

  // Save all logs
  localStorage.setItem("scanLogs", JSON.stringify(logs));
  renderLogs(logs);
  alert("Bulk scanning completed ✅");
});

// Reset Dashboard
document.getElementById("resetDashboard").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all dashboard stats?")) {
    localStorage.removeItem("scanLogs");
    loadStats();
    alert("Dashboard reset successfully!");
  }
});

// Initialize
window.onload = loadStats;
