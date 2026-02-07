let transactionCounter = 1001;
let transactions = [];

// Students
const students = {
  "2024-08-01079": { name:"Johnree Mathew A. GO", course:"BSIT", year:"2nd Year" },
  "2024-06-00060": { name:"Jashzel Yap", course:"BSIT", year:"2nd Year" },
  "2024-07-00533": { name:"John Patrick Samson", course:"BSIT", year:"2nd Year" },
  "2024-07-00321": { name:"Mark Joseph C. Tugade", course:"BSIT", year:"2nd Year" }
};

// Equipment
let equipment = [
  { id:"FAN-01", code:"EQ-001", name:"Electric Fan", status:"Available" },
  { id:"BALL-01", code:"EQ-002", name:"Ball", status:"Available" },
  { id:"SPEAKER-01", code:"EQ-003", name:"Speaker", status:"Available" },
  { id:"MONITOR-01", code:"EQ-004", name:"Monitor", status:"Available" }
];

// DOM Elements
const studentId = document.getElementById("studentId");
const sName = document.getElementById("sName");
const sCourse = document.getElementById("sCourse");
const sYear = document.getElementById("sYear");
const borrowTime = document.getElementById("borrowTime");
const equipSelect = document.getElementById("equipSelect");
const purpose = document.getElementById("purpose");
const subject = document.getElementById("subject");
const mainAreaSelect = document.getElementById("mainArea");
const specificRoomSelect = document.getElementById("specificRoom");
const duration = document.getElementById("duration");
const borrowBtn = document.getElementById("borrowBtn");
const returnSelect = document.getElementById("returnSelect");
const returnStudentIdInput = document.getElementById("returnStudentId");
const condition = document.getElementById("condition");
const returnBtn = document.getElementById("returnBtn");
const transactionTable = document.getElementById("transactionTable");

// Populate specific rooms
const specificRooms = [];
specificRooms.push("2A");
["A","B","C","D","E","F","G","H","I"].forEach(l=>specificRooms.push("3"+l));
["A","B","C","D","E","F","G","H","I"].forEach(l=>specificRooms.push("4"+l));
["A","B","C","D","E","F","G"].forEach(l=>specificRooms.push("5"+l));
specificRooms.forEach(r => specificRoomSelect.innerHTML += `<option value="${r}">${r}</option>`);

// Prevent selecting both
mainAreaSelect.addEventListener("change", ()=>{ specificRoomSelect.disabled = mainAreaSelect.value? true:false; });
specificRoomSelect.addEventListener("change", ()=>{ mainAreaSelect.disabled = specificRoomSelect.value? true:false; });

// Load from localStorage
if(localStorage.getItem("transactions")) transactions = JSON.parse(localStorage.getItem("transactions"));
if(localStorage.getItem("equipment")) equipment = JSON.parse(localStorage.getItem("equipment"));

// Student ID auto-format
studentId.addEventListener("input", ()=>{
  let val = studentId.value.replace(/[^0-9]/g,'');
  let formatted = val.slice(0,4);
  if(val.length>4) formatted += '-' + val.slice(4,6);
  if(val.length>6) formatted += '-' + val.slice(6,11);
  studentId.value = formatted;
  checkStudent();
});

returnStudentIdInput.addEventListener("input", ()=>{
  let val = returnStudentIdInput.value.replace(/[^0-9]/g,'');
  let formatted = val.slice(0,4);
  if(val.length>4) formatted += '-' + val.slice(4,6);
  if(val.length>6) formatted += '-' + val.slice(6,11);
  returnStudentIdInput.value = formatted;
});

// Display student info
function checkStudent(){
  const id = studentId.value.trim();
  if(students[id]){
    const s = students[id];
    sName.innerText = s.name;
    sCourse.innerText = s.course;
    sYear.innerText = s.year;
    borrowTime.innerText = new Date().toLocaleString();
  } else {
    sName.innerText = "-";
    sCourse.innerText = "-";
    sYear.innerText = "-";
    borrowTime.innerText = "-";
  }
  toggleBorrowButton();
}

function toggleBorrowButton(){
  const ready = studentId.value.trim() &&
                purpose.value &&
                subject.value.trim() &&
                getSelectedLabRoom() &&
                equipSelect.value &&
                students[studentId.value.trim()];
  borrowBtn.disabled = !ready;
}

// Refresh Equipment UI
function refreshEquipmentUI(){
  equipSelect.innerHTML = "";
  returnSelect.innerHTML = "";
  equipment.forEach(item=>{
    if(item.status==="Available") equipSelect.innerHTML += `<option value="${item.id}">${item.name} (${item.code})</option>`;
    if(item.status==="Borrowed") returnSelect.innerHTML += `<option value="${item.id}">${item.name} (${item.code})</option>`;
  });
}

// Get selected Lab/Room
function getSelectedLabRoom(){ return mainAreaSelect.value || specificRoomSelect.value || ""; }

// Borrow item
borrowBtn.addEventListener("click", ()=>{
  const id = studentId.value.trim();
  const s = students[id];
  const equipId = equipSelect.value;
  const purposeVal = purpose.value;
  const subjectVal = subject.value.trim();
  const labVal = getSelectedLabRoom();
  let durationVal = parseInt(duration.value) || 1440;

  if(!equipId || !purposeVal || !subjectVal || !labVal){
    alert("Please complete all required fields");
    return;
  }

  const item = equipment.find(e=>e.id===equipId);
  item.status="Borrowed";

  const now = new Date();
  const returnDeadline = new Date(now.getTime() + durationVal*60000);

  transactions.push({
    tx: transactionCounter++,
    studentID: id,
    student: s.name,
    course: s.course,
    year: s.year,
    item: item.name,
    code: item.code,
    purpose: purposeVal,
    subject: subjectVal,
    lab: labVal,
    borrowTime: now.toLocaleString(),
    duration: durationVal,
    returnTime: "-",
    status: "Borrowed",
    condition: "-",
    penalty: 0,
    deadline: returnDeadline
  });

  saveData();
  refreshTables();
  alert(`Success! ${item.name} (${item.code}) borrowed by ${s.name}`);
});

// Return item
returnBtn.addEventListener("click", ()=>{
  const equipId = returnSelect.value;
  const cond = condition.value;
  const returnStudentId = returnStudentIdInput.value.trim();

  if(!returnStudentId){
    alert("Return cancelled: Student ID required.");
    return;
  }

  const item = equipment.find(e=>e.id===equipId);
  const tx = [...transactions].reverse().find(t => 
    t.item === item.name && t.returnTime=="-" && t.studentID === returnStudentId
  );

  if(!tx) return alert("Transaction not found for this Student ID!");

  const now = new Date();
  item.status = cond==="OK"?"Available":"Damaged";

  let penalty=0;
  if(now>tx.deadline) penalty+=50;
  if(cond!=="OK") penalty+=100;

  tx.returnTime = now.toLocaleString();
  tx.condition = cond;
  tx.penalty = penalty;
  tx.status="Returned";

  saveData();
  refreshTables();
  alert(`Successfully returned ${item.name} (${item.code}) by Student ID: ${returnStudentId}`);
});

// Refresh Transaction Table
function refreshTables(){
  transactionTable.innerHTML="";
  transactions.forEach(t=>{
    transactionTable.innerHTML+=`
      <tr>
        <td>${t.studentID}</td>
        <td>${t.student}</td>
        <td>${t.course}</td>
        <td>${t.year}</td>
        <td>${t.item}</td>
        <td>${t.code}</td>
        <td>${t.purpose}</td>
        <td>${t.subject}</td>
        <td>${t.lab}</td>
        <td>${t.borrowTime}</td>
        <td>${t.duration}</td>
        <td>${t.returnTime}</td>
        <td>${t.status}</td>
        <td>${t.condition}</td>
        <td>${t.penalty}</td>
      </tr>
    `;
  });
  refreshEquipmentUI();
  toggleBorrowButton();
}

// Save to localStorage
function saveData(){
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("equipment", JSON.stringify(equipment));
}

// Initial load
refreshTables();
