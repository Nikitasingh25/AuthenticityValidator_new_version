// -------------------------
// Scroll Progress Bar
// -------------------------
window.addEventListener("scroll", () => {
  let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let scrollPercent = (scrollTop / scrollHeight) * 100;
  const bar = document.getElementById("progressBar");
  if (bar) bar.style.width = scrollPercent + "%";
});

// -------------------------
// Highlight Active Nav Link
// -------------------------
document.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// -------------------------
// Scan Form Handling (Single File)
// -------------------------
const scanForm = document.getElementById("scanForm");

if (scanForm) {
  scanForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const certFile = document.getElementById("certFile").files[0];

    if (!certFile) {
      return alert("⚠️ Please upload a certificate file before scanning.");
    }

    // Redirect to scan-result page
    window.location.href = `scan-result.html?file=${encodeURIComponent(certFile.name)}`;
  });
}

// -------------------------
// Scan Result Page Handling
// -------------------------
const resultBox = document.getElementById("resultBox");
if (resultBox) {
  const params = new URLSearchParams(window.location.search);
  const fileName = params.get("file");

  if (fileName) {
    resultBox.innerHTML = "<p style='color:orange;'>⏳ Scanning... Please wait.</p>";

    setTimeout(async () => {
      const loggedUser = "Admin123"; // Simulated user
      let status = "Unknown";
      let dbStatus = "Not Found";

      try {
        // Simulate file object for API call
        const simulatedFile = new File([""], fileName);

        const formData = new FormData();
        formData.append("file", simulatedFile);

        const response = await fetch("/api/scan", {
          method: "POST",
          body: formData
        });

        if (response.ok) {
          const data = await response.json(); // Expected format: {status:"Genuine"/"Fake", dbStatus:"..."}
          status = data.status || status;
          dbStatus = data.dbStatus || dbStatus;
        } else {
          // API failed fallback
          status = fileName.toLowerCase().includes("fake") ? "Fake" : "Genuine";
        }
      } catch (err) {
        // Local fallback simulation
        status = fileName.toLowerCase().includes("fake") ? "Fake" : "Genuine";
      }

      const result = {
        file: fileName,
        user: loggedUser,
        status: status,
        dbStatus: dbStatus,
        time: new Date().toLocaleString()
      };

      if (status === "Fake") {
        resultBox.innerHTML = `
          <h3>Certificate Report</h3>
          <p style="color:red; font-weight:bold;">❌ Fake Certificate Detected</p>
          <p><strong>File:</strong> ${result.file}</p>
          <p><strong>Scanned By:</strong> ${result.user}</p>
          <p><strong>Database Status:</strong> ${result.dbStatus}</p>
          <p><strong>Time:</strong> ${result.time}</p>
        `;
      } else {
        resultBox.innerHTML = `
          <h3>Certificate Report</h3>
          <p style="color:lime; font-weight:bold;">✅ Certificate is Genuine</p>
          <p><strong>File:</strong> ${result.file}</p>
          <p><strong>Scanned By:</strong> ${result.user}</p>
          <p><strong>Database Status:</strong> ${result.dbStatus}</p>
          <p><strong>Time:</strong> ${result.time}</p>
        `;
      }

      // Save to localStorage for admin dashboard
      let logs = JSON.parse(localStorage.getItem("scanLogs")) || [];
      logs.push(result);
      localStorage.setItem("scanLogs", JSON.stringify(logs));

    }, 2000);
  } else {
    resultBox.innerHTML = "<p style='color:orange;'>⚠️ No file uploaded.</p>";
  }
}
